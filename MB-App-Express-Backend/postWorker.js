// src/workers/postWorker.js
require('dotenv').config();
const { makeWorker, makeQueueEvents } = require('./connection');
const { postQueueName } = require('./postQueue');
const db = require('./db'); // pg Pool/Client

async function handleCreatePost(job){
  const { forum_id, body, title, poster_id , parent_post_id } = job.data;
  // Idempotent insert: if the post already exists, do nothing
  const result = await db.query(`
    INSERT INTO posts (forum_id, body, title, poster_id , parent_post_id)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (poster_id) DO NOTHING
    RETURNING poster_id
  `, [forum_id, body, title, poster_id , parent_post_id]);



  return { ok: true, poster_id };

}

async function handleCreateReply(job){

  //INSERT INTO posts (forum_id, body, poster_id , post_time, parent_post_id ) VALUES($1, $2, $3, $4, $5) ',
  //  values: [forum_id, req.body.body, reply_uuid, new_datetime, parent_post_id]
  const { forum_id, body,  poster_id , parent_post_id } = job.data;
  // Idempotent insert: if the post already exists, do nothing
  console.log('reply insert in to db', forum_id, body, "poster_id", poster_id, parent_post_id)
  await db.query(`
    INSERT INTO posts (forum_id, body, poster_id , parent_post_id)
    VALUES ($1, $2, $3, $4 )
    ON CONFLICT (poster_id) DO NOTHING
  `, [forum_id, body , poster_id , parent_post_id]);
  return { ok: true, poster_id };

}

const worker = makeWorker(postQueueName, async (job) => {

  switch (job.name){
    case 'CreatePost':
      return handleCreatePost(job);
    case "CreateReply":
      return handleCreateReply(job)
    default: return { skipped: true };
  
  }
 
}, { concurrency: 5 });

const qe = makeQueueEvents(postQueueName);
qe.on('completed', ({ jobId }) => console.log(`[worker] ✓ ${jobId}`));
qe.on('failed', ({ jobId, failedReason }) => console.error(`[worker] ✗ ${jobId}: ${failedReason}`));

// graceful shutdown
async function shutdown() {
  await worker.close(); await qe.close(); process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = {
  handleCreatePost
};
