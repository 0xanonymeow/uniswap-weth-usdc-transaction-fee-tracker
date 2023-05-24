// @ts-nocheck

const { CronJob } = require('cron');
const { getLiveData } = require('./tasks/getLiveData');

const onComplete = () => {};

const onTick = (onComplete) => {
  getLiveData();
  onComplete();
};

const job = new CronJob('*/5 * * * * *', onTick, onComplete, false); // schedule a job to run every 5 seconds

module.exports = {
  job,
};
