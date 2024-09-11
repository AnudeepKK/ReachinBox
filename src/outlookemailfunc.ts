import { getOutlookClient, refreshOutlookToken } from './outlookauthfunc';
import { getGroqChatCompletion, generateResponse } from './OpenAI';
import { GraphError } from '@microsoft/microsoft-graph-client';

export const getLatestEmail = async () => {
  try {
    const client = await getOutlookClient();
    const messages = await client.api('/users/me/messages')
      .filter('isRead eq false')
      .top(1)
      .get();

    if (!messages.value || messages.value.length === 0) {
      throw new Error('No unread messages found');
    }

    return messages.value[0];
  } catch (error) {
    if (error instanceof GraphError && error.statusCode === 401) {
      console.error('Token expired, attempting to refresh...');
      try {
        // Refresh the token and retry
        await refreshOutlookToken();
        const client = await getOutlookClient();
        const messages = await client.api('/users/me/messages')
          .filter('isRead eq false')
          .top(1)
          .get();

        if (!messages.value || messages.value.length === 0) {
          throw new Error('No unread messages found after token refresh');
        }
        return messages.value[0];
      } catch (refreshError) {
        console.error('Error fetching email after token refresh:', refreshError);
        throw refreshError;
      }
    } else {
      console.error('Error fetching latest email:', error);
      throw error;
    }
  }
};

export const sendEmail = async (to: string, subject: string, body: string) => {
  try {
    const client = await getOutlookClient(); // Added await here
    const message = {
      subject: subject,
      body: {
        contentType: 'Text',
        content: body,
      },
      toRecipients: [
        {
          emailAddress: {
            address: to,
          },
        },
      ],
    };

    await client.api('/users/me/sendMail').post({ message });
    console.log(`Email sent to: ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export const applyLabelToEmail = async (emailId: string, labelName: string) => {
  try {
    const client = await getOutlookClient(); // Added await here
    await client.api(`/users/me/messages/${emailId}`).update({
      categories: [labelName],
    });
    console.log(`Applied category ${labelName} to email ${emailId}`);
  } catch (error) {
    console.error('Error applying category:', error);
  }
};

export const processEmail = async () => {
  try {
    const email = await getLatestEmail();
    const subject = email.subject || 'No Subject';
    const content = email.bodyPreview || '';
    const sender = email.from?.emailAddress?.address || '';

    // Call AI services for categorization and response generation
    const category = await getGroqChatCompletion(subject, content);
    const response = await generateResponse(category, subject, content);

    // Send response email
    await sendEmail(sender, `Re: ${subject}`, response);

    // Apply label to email
    await applyLabelToEmail(email.id, category);

    return `Email processed. Category: ${category}, Response sent to: ${sender}`;
  } catch (error) {
    console.error('Error processing email:', error);
    if (error instanceof GraphError) {
      console.error('GraphError details:', {
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
        requestId: error.requestId,
      });
    }
    return 'Error processing email';
  }
};
