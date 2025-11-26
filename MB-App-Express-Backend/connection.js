// src/queues/connection.js
require('dotenv').config();
const { Queue, Worker, QueueEvents } = require('bullmq');

const redisConfig = {
  host: process.env.REDIS_HOST || 'redis',
  port: Number(process.env.REDIS_PORT || 6379),
  // password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null
};

function makeQueue(name) {
  return new Queue(name, { connection: redisConfig });
}

function makeWorker(name, processor, opts = {}) {
  return new Worker(name, processor, { connection: redisConfig, concurrency: 5, ...opts });
}

function makeQueueEvents(name) {
  return new QueueEvents(name, { connection: redisConfig });
}

module.exports = { makeQueue, makeWorker, makeQueueEvents };