import { processAllEmails } from './emailQueue';

export function startAutomatedProcessing() {
  // Add initial jobs to the queue
  processAllEmails();

  // Schedule jobs to run every 1 minute (60,000 milliseconds)
  setInterval(processAllEmails, 60 * 1000); // 1 minute interval

  console.log('Automated email processing scheduled.');
}
