// @ts-nocheck

const { CronJob } = require('cron');
const { getLiveData } = require('./tasks/getLiveData');

const onComplete = () => {};

const onTick = (onComplete) => {
  getLiveData();
  onComplete();
};

const job = new CronJob('* * * * *', onTick, onComplete, false); // schedule a job to run every minute

module.exports = {
  job,
};
