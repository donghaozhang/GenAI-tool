#!/usr/bin/env node

/**
 * Test script to reproduce chat_messages_session_id_fkey violation
 * 
 * This script simulates the exact sequence of API calls that leads to 
 * inserting a message before a session exists.
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { v4: uuidv4 } = require('uuid');

// Local Supabase configuration
const SUPABASE_URL = 'http://127.0.0.1:54321';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

/**
 * Test scenario 1: Multiple messages in first request
 * This could trigger the bug where messages.length > 1 skips session creation
 */
async function testScenario1() {
  console.log('\n🧪 Test Scenario 1: Multiple messages in first request');
  console.log('======================================================');
  
  const sessionId = uuidv4();
  const canvasId = uuidv4();
  
  console.log(`Session ID: ${sessionId}`);
  console.log(`Canvas ID: ${canvasId}`);
  
  // Simulate sending multiple messages at once (e.g., system prompt + user message)
  const payload = {
    session_id: sessionId,
    canvas_id: canvasId,
    messages: [
      {
        role: 'system',
        content: 'You are a helpful AI assistant.'
      },
      {
        role: 'user', 
        content: 'Hello, can you help me design something?'
      }
    ],
    text_model: {
      model: 'openai/gpt-4o-mini',
      provider: 'openai'
    },
    system_prompt: 'You are a helpful AI assistant.'
  };
  
  console.log('\n📤 Sending chat request with multiple messages:');
  console.log(JSON.stringify(payload, null, 2));
  
  try {
    const response = await fetch(`${FUNCTIONS_URL}/jaaz-chat/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.log('\n❌ Error response:');
      console.log(JSON.stringify(result, null, 2));
      
      if (result.details && result.details.includes('chat_messages_session_id_fkey')) {
        console.log('\n🎯 REPRODUCED FK ERROR!');
        console.log('Foreign key constraint violation detected');
        return true;
      }
    } else {
      console.log('\n✅ Success response:');
      console.log(JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.log('\n💥 Network/Parse error:', error.message);
  }
  
  return false;
}

/**
 * Test scenario 2: Race condition - concurrent requests
 * Multiple requests with same session_id sent rapidly
 */
async function testScenario2() {
  console.log('\n🧪 Test Scenario 2: Race condition with concurrent requests');
  console.log('==========================================================');
  
  const sessionId = uuidv4();
  const canvasId = uuidv4();
  
  console.log(`Session ID: ${sessionId}`);
  console.log(`Canvas ID: ${canvasId}`);
  
  // Create multiple concurrent requests
  const requests = [];
  
  for (let i = 0; i < 3; i++) {
    const payload = {
      session_id: sessionId,
      canvas_id: canvasId,
      messages: [
        {
          role: 'user',
          content: `Message ${i + 1}: Hello from concurrent request ${i + 1}`
        }
      ],
      text_model: {
        model: 'openai/gpt-4o-mini',
        provider: 'openai'
      }
    };
    
    console.log(`\n📤 Creating concurrent request ${i + 1}`);
    
    const requestPromise = fetch(`${FUNCTIONS_URL}/jaaz-chat/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify(payload)
    }).then(async (response) => {
      const result = await response.json();
      return { request: i + 1, response, result };
    }).catch(error => {
      return { request: i + 1, error: error.message };
    });
    
    requests.push(requestPromise);
  }
  
  console.log('\n⏳ Waiting for all concurrent requests to complete...');
  
  try {
    const results = await Promise.all(requests);
    
    let fkErrorDetected = false;
    
    results.forEach(({ request, response, result, error }) => {
      console.log(`\n📥 Request ${request} result:`);
      
      if (error) {
        console.log(`❌ Error: ${error}`);
      } else if (!response.ok) {
        console.log('❌ Error response:');
        console.log(JSON.stringify(result, null, 2));
        
        if (result.details && result.details.includes('chat_messages_session_id_fkey')) {
          console.log('🎯 FK ERROR DETECTED!');
          fkErrorDetected = true;
        }
      } else {
        console.log('✅ Success response');
      }
    });
    
    return fkErrorDetected;
    
  } catch (error) {
    console.log('\n💥 Promise.all error:', error.message);
    return false;
  }
}

/**
 * Test scenario 3: Direct database insertion bypass
 * Attempt to insert message without session existing
 */
async function testScenario3() {
  console.log('\n🧪 Test Scenario 3: Direct database insertion without session');
  console.log('==============================================================');
  
  const sessionId = uuidv4();
  
  console.log(`Non-existent Session ID: ${sessionId}`);
  
  // Try to create a message for a session that doesn't exist
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, ANON_KEY);
  
  console.log('\n📤 Attempting to insert message without session...');
  
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role: 'user',
        content: 'This message has no valid session'
      });
    
    if (error) {
      console.log('\n❌ Database error:');
      console.log(JSON.stringify(error, null, 2));
      
      if (error.code === '23503' || error.message.includes('foreign key constraint')) {
        console.log('\n🎯 REPRODUCED FK ERROR!');
        console.log('Foreign key constraint violation detected');
        return true;
      }
    } else {
      console.log('\n✅ Unexpected success:');
      console.log(JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.log('\n💥 Client error:', error.message);
  }
  
  return false;
}

/**
 * Check database state and capture logs
 */
async function checkDatabaseState() {
  console.log('\n📊 Database State Check');
  console.log('========================');
  
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, ANON_KEY);
  
  // Check sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from('chat_sessions')
    .select('*');
    
  if (sessionsError) {
    console.log('❌ Error fetching sessions:', sessionsError);
  } else {
    console.log(`\n📋 Chat Sessions (${sessions.length}):`);
    sessions.forEach(session => {
      console.log(`  - ${session.id}: "${session.title}" (${session.created_at})`);
    });
  }
  
  // Check messages
  const { data: messages, error: messagesError } = await supabase
    .from('chat_messages')
    .select('*');
    
  if (messagesError) {
    console.log('❌ Error fetching messages:', messagesError);
  } else {
    console.log(`\n💬 Chat Messages (${messages.length}):`);
    messages.forEach(message => {
      console.log(`  - ${message.id}: ${message.role} in session ${message.session_id}`);
    });
  }
}

/**
 * Main test runner
 */
async function main() {
  console.log('🔍 Chat FK Error Reproduction Test');
  console.log('====================================');
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Functions URL: ${FUNCTIONS_URL}`);
  
  let fkErrorReproduced = false;
  
  // Check initial state
  await checkDatabaseState();
  
  // Run test scenarios
  if (await testScenario1()) fkErrorReproduced = true;
  if (await testScenario2()) fkErrorReproduced = true;
  if (await testScenario3()) fkErrorReproduced = true;
  
  // Check final state
  await checkDatabaseState();
  
  console.log('\n📋 Test Summary');
  console.log('================');
  
  if (fkErrorReproduced) {
    console.log('🎯 SUCCESS: Foreign key error reproduced!');
    console.log('The chat_messages_session_id_fkey violation has been confirmed.');
  } else {
    console.log('❌ No FK errors detected.');
    console.log('The scenarios tested did not trigger the foreign key violation.');
  }
  
  console.log('\n🏁 Test completed.');
}

// Install dependencies check
// Dependencies are available in the project

if (require.main === module) {
  main().catch(console.error);
}
