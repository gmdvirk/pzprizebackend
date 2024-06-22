const Queue = require('bull');
const redisConfig = {
  host: '127.0.0.1',
  port: 6379,
};

const paymentQueue = new Queue('paymentQueue', { redis: redisConfig });

module.exports = paymentQueue;
