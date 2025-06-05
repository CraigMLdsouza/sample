import { Auth0Client } from "@auth0/nextjs-auth0/server"

// Add debug logging for Auth0 configuration
console.log('Auth0 Configuration:', {
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID ? '***' : undefined, // Mask client ID for security
  appBaseUrl: process.env.APP_BASE_URL,
  // Don't log secrets
});

export const auth0 = new Auth0Client()