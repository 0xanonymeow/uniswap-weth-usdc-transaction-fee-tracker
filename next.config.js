/** @type {import('next').NextConfig} */
const { job } = require('./app/api/cron/index');

const nextConfig = {};

module.exports = async () => {
  job.start();
  return nextConfig;
};
