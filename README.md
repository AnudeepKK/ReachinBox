
---

# Email Parsing and Auto-Responder Tool

This tool automatically parses and checks emails from Google and Outlook accounts using OAuth2 authentication, categorizes them using AI, and sends automated responses based on the content. It also uses BullMQ for task scheduling to handle email processing asynchronously.

## Features
- OAuth2 integration with Gmail and Outlook to access emails.
- Automatic categorization of emails into:
  - Interested
  - Not Interested
  - More Information
- AI-powered automated responses based on email content using OpenAI.
- BullMQ used as a task scheduler for email processing.
- Written in TypeScript for strong typing and maintainability.

## How It Works
1. **OAuth Setup**: Authenticate with Google and Outlook via OAuth to access email accounts.
2. **Email Parsing**: The tool reads incoming emails and categorizes them based on their content using OpenAI.
3. **Email Categorization**: Emails are automatically labeled as "Interested," "Not Interested," or "More Information."
4. **Auto-Response**: The tool uses OpenAI to generate an appropriate reply based on the email content and automatically sends the response.
5. **Task Scheduling**: BullMQ schedules the task of reading emails and processing them asynchronously to ensure scalability.

## Endpoints
- **Gmail OAuth**: 
  ```
  /auth/gmail
  ```
- **Outlook OAuth**: 
  ```
  /auth/outlook
  ```
- **Process Gmail Emails**: 
  ```
  /process-email/gmail
  ```
- **Process Outlook Emails**: 
  ```
  /process-email/outlook
  ```

## Technologies Used
- **Node.js**: Backend JavaScript runtime
- **TypeScript**: Static typing for better maintainability
- **Express**: Web framework for Node.js
- **BullMQ**: Queue system for handling tasks
- **Redis**: In-memory data structure store used by BullMQ
- **Google Cloud console**: For Gmail integration
- **Microsoft Azure App registration**: For Outlook integration
- **GroqCloud**: AI model to categorize and generate responses

---
