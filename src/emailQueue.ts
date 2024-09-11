import { Queue, Worker } from 'bullmq';
import { processEmail as processGmailEmail } from './emailfunc';
import { processEmail as processOutlookEmail } from './outlookemailfunc';

// Redis connection configuration
const connection = {
  host: '127.0.0.1',  // Redis server host (localhost)
  port: 6379          // Redis server port (default is 6379)
};

// Create a new BullMQ Queue with the Redis connection
const emailQueue = new Queue('email-queue', { connection });

// Worker to process the Gmail and Outlook jobs
new Worker('email-queue', async (job) => {
  if (job.name === 'gmail-job') {
    console.log('Processing Gmail...');
    await processGmailEmail();
    console.log('Gmail processing completed');
 } 
//else if (job.name === 'outlook-job') {
//     console.log('Processing Outlook...');
//     await processOutlookEmail();
//     console.log('Outlook processing completed');
//   }
}, { connection }); // Pass the Redis connection here as well

// Function to add jobs to the queue
export async function processAllEmails() {
  console.log('Adding jobs to the queue...');

  try {
    // Add Gmail processing job
    await emailQueue.add('gmail-job', {});
    console.log('Gmail job added');
    // Add Outlook processing job
    // await emailQueue.add('outlook-job', {});
    // console.log('Outlook job added');
  } catch (error) {
    console.error('Error adding jobs to the queue:', error);
  }
}
