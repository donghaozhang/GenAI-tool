// scripts/test-google-oauth.js
// Quick script to validate that Google OAuth is correctly configured in Supabase.
// It performs a HEAD request to the /auth/v1/authorize endpoint and reports the
// HTTP status and Location header. If everything is configured, Supabase will
// return a 302 redirect to https://accounts.google.com/ with your client_id.
//
// Usage:  node scripts/test-google-oauth.js
//
// You can optionally pass your own redirect URL as the first CLI argument.

import { argv } from "node:process";

// ----- Configuration -------------------------------------------------------
const SUPABASE_PROJECT_URL = "https://wdprvtqbwnhwbpufcmgg.supabase.co"; // <-- update if needed
const DEFAULT_REDIRECT = "http://localhost:8081/";

// ---------------------------------------------------------------------------
const redirectTo = argv[2] || DEFAULT_REDIRECT;

const authorizeUrl = `${SUPABASE_PROJECT_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(
  redirectTo
)}`;

(async () => {
  console.log("Checking Google OAuth redirect for Supabase project:\n", authorizeUrl);
  try {
    const res = await fetch(authorizeUrl, {
      method: "GET", // Supabase doesn't support HEAD on this endpoint
      redirect: "manual", // don't follow the 302
    });

    console.log("\nHTTP status:", res.status);

    const location = res.headers.get("location");
    if (location) {
      console.log("Redirect Location:\n", location);
      if (location.startsWith("https://accounts.google.com")) {
        console.log("\n✅ Supabase correctly redirects to Google. Configuration looks good.");
      } else if (location.includes("provider_error")) {
        console.error("\n❌ Supabase responded with an error from the provider. Google config is likely wrong.");
      } else {
        console.warn("\n⚠️ Unexpected redirect location. Please verify your settings.");
      }
    } else {
      console.error("\n❌ No Location header found. Supabase did not attempt to redirect.");
    }
  } catch (err) {
    console.error("Failed to contact Supabase:", err);
  }
})(); 