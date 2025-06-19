// Browser Console Pipeline Test Script
// This version uses the same method as the actual app

async function runBrowserPipelineTest() {
    console.log('🔧 === BROWSER PIPELINE TEST ===');
    console.log('This test uses the same Supabase client as your app');
    
    try {
        // First, let's check if we can access the Supabase client from the global scope
        console.log('\n=== STEP 1: Accessing Supabase Client ===');
        
        // Try to access Supabase from the window object (sometimes available in React apps)
        let supabase = null;
        
        // Method 1: Try to find it in React DevTools
        if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
            console.log('React DevTools detected, looking for Supabase...');
        }
        
        // Method 2: Try to import it dynamically
        try {
            console.log('Attempting to import Supabase client...');
            const module = await import('/src/integrations/supabase/client.ts');
            supabase = module.supabase;
            console.log('✅ Successfully imported Supabase client!');
        } catch (importError) {
            console.log('❌ Could not import Supabase client:', importError.message);
            
            // Method 3: Use fetch directly to the Supabase function URL
            console.log('Falling back to direct HTTP calls...');
            return await runDirectHttpTest();
        }
        
        // Step 2: Test API Key Configuration
        console.log('\n=== STEP 2: Testing FAL API Key Configuration ===');
        
        const { data: testData, error: testError } = await supabase.functions.invoke('process-image-pipeline', {
            body: { action: 'test' }
        });
        
        console.log('🔑 API Key Test Result:', { testData, testError });
        
        if (testError) {
            console.error('❌ API Key test failed:', testError);
            console.error('Make sure to set FAL_API_KEY in Supabase Dashboard → Project Settings → Edge Functions → Environment Variables');
            return;
        }
        
        if (testData?.status === 'success') {
            console.log('✅ FAL API Key is configured correctly!');
        } else {
            console.error('❌ FAL API Key is not configured or invalid');
            return;
        }
        
        // Step 3: Test Image Pipeline Submission
        console.log('\n=== STEP 3: Testing Image Pipeline Submission ===');
        
        const { data: submitData, error: submitError } = await supabase.functions.invoke('process-image-pipeline', {
            body: {
                modelId: 'fal-ai/flux-pro',
                prompt: 'A simple test image of a red apple on a white background'
            }
        });
        
        console.log('📤 Submit Result:', { submitData, submitError });
        
        if (submitError) {
            console.error('❌ Pipeline submission failed:', submitError);
            return;
        }
        
        if (!submitData?.success || !submitData?.requestId) {
            console.error('❌ Invalid submission response:', submitData);
            return;
        }
        
        console.log('✅ Pipeline submitted successfully!');
        console.log(`📋 Request ID: ${submitData.requestId}`);
        console.log(`🔗 Status URL: ${submitData.statusUrl}`);
        console.log(`🔗 Response URL: ${submitData.responseUrl}`);
        
        // Step 4: Monitor Progress
        console.log('\n=== STEP 4: Monitoring Pipeline Progress ===');
        
        let attempts = 0;
        const maxAttempts = 24; // 2 minutes max (5 second intervals)
        
        while (attempts < maxAttempts) {
            console.log(`\n⏱️ Checking status (attempt ${attempts + 1}/${maxAttempts})...`);
            
            const { data: statusData, error: statusError } = await supabase.functions.invoke('process-image-pipeline', {
                body: {
                    action: 'status',
                    statusUrl: submitData.statusUrl
                }
            });
            
            if (statusError) {
                console.error(`❌ Status check failed:`, statusError);
                attempts++;
                await new Promise(resolve => setTimeout(resolve, 5000));
                continue;
            }
            
            console.log(`📊 Status: ${statusData.status}`);
            
            if (statusData.status === 'COMPLETED') {
                console.log('🎉 Pipeline completed! Getting results...');
                
                const { data: resultData, error: resultError } = await supabase.functions.invoke('process-image-pipeline', {
                    body: {
                        action: 'result',
                        responseUrl: submitData.responseUrl
                    }
                });
                
                if (resultError) {
                    console.error('❌ Result fetch failed:', resultError);
                    return;
                }
                
                console.log('🖼️ Final Result:', resultData);
                
                if (resultData.images && resultData.images.length > 0) {
                    console.log('✅ SUCCESS! Image generation completed successfully!');
                    console.log(`🖼️ Generated ${resultData.images.length} image(s)`);
                    console.log('🔗 Image URL:', resultData.images[0].url);
                } else {
                    console.log('⚠️ Pipeline completed but no images returned');
                    console.log('Result data:', resultData);
                }
                break;
                
            } else if (statusData.status === 'ERROR') {
                console.error('❌ Pipeline failed:', statusData);
                break;
                
            } else {
                console.log(`⏳ Still processing... (${statusData.status})`);
                if (statusData.queue_position) {
                    console.log(`Queue position: ${statusData.queue_position}`);
                }
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
                attempts++;
            }
        }
        
        if (attempts >= maxAttempts) {
            console.log('⏰ Test timed out after 2 minutes');
        }
        
    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
    
    console.log('\n🏁 Browser pipeline test completed!');
}

// Fallback method using direct HTTP calls
async function runDirectHttpTest() {
    console.log('\n=== FALLBACK: Using Direct HTTP Calls ===');
    
    // Get Supabase config from the app
    const SUPABASE_URL = 'https://wdprvtqbwnhwbpufcmgg.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkcHJ2dHFid25od2JwdWZjbWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NDQyODksImV4cCI6MjA2NTUyMDI4OX0.6_f-ggUyf57kq1onDb_eXXPZSyctVpi7bglTxK_V0fE';
    
    const functionUrl = `${SUPABASE_URL}/functions/v1/process-image-pipeline`;
    
    // Test API key
    console.log('Testing API key configuration...');
    const testResponse = await fetch(functionUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'test' })
    });
    
    const testResult = await testResponse.json();
    console.log('API Key Test Result:', testResult);
    
    if (testResult.status === 'success') {
        console.log('✅ FAL API Key is configured correctly!');
        console.log('You can now test the image pipeline in your app!');
    } else {
        console.error('❌ FAL API Key is not configured');
        console.error('Go to: Supabase Dashboard → Project Settings → Edge Functions → Environment Variables');
        console.error('Add: FAL_API_KEY = your_fal_api_key_here');
    }
}

// Auto-run the test
console.log('🚀 Starting browser pipeline test...');
runBrowserPipelineTest(); 