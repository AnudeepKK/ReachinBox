import { ConfidentialClientApplication, Configuration, AuthorizationUrlRequest, AuthorizationCodeRequest, SilentFlowRequest } from "@azure/msal-node";
import { Client } from "@microsoft/microsoft-graph-client";
import { config } from './keys';

if (!config.outlook.clientId || !config.outlook.clientSecret || !config.outlook.tenantId || !config.outlook.redirectUri) {
  throw new Error('Outlook configuration is incomplete. Please check your .env file.');
}

let accessToken: string | null = null;
let account: any = null;  // Store the account to use in silent requests

const msalConfig: Configuration = {
  auth: {
    clientId: config.outlook.clientId,
    clientSecret: config.outlook.clientSecret,
    authority: `https://login.microsoftonline.com/${config.outlook.tenantId}`,
  }
};

const pca = new ConfidentialClientApplication(msalConfig);
const redirectUri = config.outlook.redirectUri;

// Get the authorization URL to redirect the user for consent
export const getOutlookAuthUrl = async () => {
  const authCodeUrlParameters: AuthorizationUrlRequest = {
    scopes: ["api://771a381a-b6ba-41c1-93e6-e170138af523/Anudeep"],
    redirectUri: redirectUri,
  };

  return await pca.getAuthCodeUrl(authCodeUrlParameters);
};

// Get the token using the authorization code
export const getOutlookToken = async (code: string) => {
  const tokenRequest: AuthorizationCodeRequest = {
    code: code,
    scopes: ["api://771a381a-b6ba-41c1-93e6-e170138af523/Anudeep"],
    redirectUri: redirectUri,
  };
  
  try {
    const response = await pca.acquireTokenByCode(tokenRequest);
    accessToken = response.accessToken;
    account = response.account;  // Store the account for future silent requests
    console.log('Token acquired successfully');
    return accessToken;
  } catch (error) {
    console.error('Error acquiring token:', error);
    throw error;
  }
};

// Refresh the token silently if it has expired
export const refreshOutlookToken = async () => {
  if (!account) {
    throw new Error('No account found to refresh token. Please authenticate first.');
  }

  const silentRequest: SilentFlowRequest = {
    account: account,
    scopes: ["api://771a381a-b6ba-41c1-93e6-e170138af523/Anudeep"],
  };

  try {
    const response = await pca.acquireTokenSilent(silentRequest);
    accessToken = response.accessToken;
    console.log('Token refreshed successfully');
    return accessToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

// Get the Microsoft Graph Client instance
export const getOutlookClient = () => {
  if (!accessToken) {
    console.error('Access token not available. Please authenticate or refresh token first.');
    throw new Error('Access token not available. Please authenticate first.');
  }

  return Client.init({
    authProvider: async (done) => {
      // Check if the token needs to be refreshed
      try {
        if (!accessToken) {
          await refreshOutlookToken(); // Attempt to refresh token if needed
        }
        done(null, accessToken); // Provide the valid token to the client
      } catch (error) {
        done(error, null); // Return an error if token could not be refreshed
      }
    }
  });
};

// Verify that the token works by calling the Microsoft Graph API
export const verifyOutlookToken = async () => {
  try {
    const client = getOutlookClient();
    const result = await client.api('/me').get();
    console.log('Token verification successful:', result);
    return true;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};
