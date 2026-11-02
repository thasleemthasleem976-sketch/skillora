import { Queue, Worker } from 'bullmq';
import { redisClient, isRedisAvailable } from '../config/redis.js';

let videoProcessingQueue = null;
let examEvaluationQueue = null;

// Initialize BullMQ if Redis connected
export const initQueues = async () => {
  if (isRedisAvailable && redisClient) {
    try {
      videoProcessingQueue = new Queue('video-processing', { connection: redisClient });
      examEvaluationQueue = new Queue('exam-evaluation', { connection: redisClient });

      new Worker(
        'video-processing',
        async (job) => {
          console.log(`[BullMQ Worker] Processing video job: ${job.name} (id: ${job.id})`);
          // simulate background transcoding / indexing
          await new Promise((resolve) => setTimeout(resolve, 1500));
          return { status: 'processed', videoId: job.data.videoId };
        },
        { connection: redisClient }
      );

      console.log('[Queue Service] BullMQ queues & workers initialized.');
    } catch (err) {
      console.warn('[Queue Service] BullMQ setup fallback to in-memory:', err.message);
    }
  }
};

// Dispatch job helper with fallback
export const dispatchJob = async (queueName, jobName, payload) => {
  if (isRedisAvailable && (queueName === 'video-processing' ? videoProcessingQueue : examEvaluationQueue)) {
    try {
      const q = queueName === 'video-processing' ? videoProcessingQueue : examEvaluationQueue;
      await q.add(jobName, payload);
      return { method: 'bullmq', jobName };
    } catch (err) {
      console.warn('[Queue Service] Fallback to in-memory dispatch:', err.message);
    }
  }

  // Graceful In-Memory Asynchronous Job execution
  setImmediate(async () => {
    try {
      console.log(`[Background Job (In-Memory)] Executing '${jobName}' on '${queueName}':`, payload.title || payload.id || 'Task');
      if (queueName === 'video-processing') {
        // e.g. record metadata / trigger video ready status
      }
    } catch (e) {
      console.error(`[Background Job Error]:`, e);
    }
  });

  return { method: 'in-memory', jobName };
};
