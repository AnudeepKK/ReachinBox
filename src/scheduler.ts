import { processAllEmails } from './emailQueue';

export function startAutomatedProcessing() {
  
  processAllEmails();

  setInterval(processAllEmails, 60 * 1000); // 1 minute interval

  console.log('Automated email processing scheduled.');
}
