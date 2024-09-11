import { google } from 'googleapis';
import { config } from './keys';

const oauth2Client = new google.auth.OAuth2(
  config.gmail.clientId,
  config.gmail.clientSecret,
  config.gmail.redirectUri
);

export const getAuthUrl = () => {
  const url =  oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.modify'],
  });
  console.log('Generated Auth URL:', url);
  return url;
};

export const getToken = async (code: string) => {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
};

export const setCredentials = (tokens: any) => {
  oauth2Client.setCredentials(tokens);
};

export { oauth2Client };