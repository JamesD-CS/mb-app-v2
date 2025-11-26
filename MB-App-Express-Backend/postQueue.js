const { makeQueue } = require('./connection');
const postQueueName = 'post-events';
const postQueue = makeQueue(postQueueName);

module.exports = { postQueueName, postQueue };