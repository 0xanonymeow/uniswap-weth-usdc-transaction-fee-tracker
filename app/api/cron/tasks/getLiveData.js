// @ts-nocheck

const {
  UNISWAP_WETH_USDC_PAIR_CONTRACT_ADDRESS,
} = require('../../../../constants/contracts');
const { map } = require('lodash');

const transformData = (data) =>
  map(
    data,
    ({
      hash,
      timeStamp,
      from,
      value,
      tokenName,
      tokenSymbol,
      tokenDecimal,
      gasUsed,
      gasPrice,
      confirmations,
    }) => ({
      hash,
      date: new Date(Number(timeStamp) * 1000),
      from,
      value,
      tokenName,
      tokenSymbol,
      tokenDecimal,
      fee: String((Number(gasUsed) * Number(gasPrice)) / 10 ** 9), // gasPrice is denoted in gwei, convert it to eth for later calculation
      confirmations,
    }),
  ).filter(({ confirmations }) => Number(confirmations) > 0);

const createMany = async (result) => {
  const transformedData = transformData(result);

  const { count } = await prisma.transaction.createMany({
    data: transformedData,
    skipDuplicates: true,
  });

  if (count) console.log(`inserted ${count} records`);

  return [transformedData, transformedData.length];
};

const prisma = new PrismaClient();

const getLiveData = async () => {
  const baseUrl = process.env.ETHERSCAN_BASE_URL;

  const params = new URLSearchParams({
    module: 'account',
    action: 'tokentx',
    address: UNISWAP_WETH_USDC_PAIR_CONTRACT_ADDRESS,
    page: '1',
    offset: '1000',
    sort: 'desc',
  });

  const apiKey = process.env.ETHERSCAN_API_KEY;
  if (apiKey) params.append('apikey', apiKey); // if apiKey is undefined, rate limit of 1 request per 5 seconds will be applied

  try {
    const res = await fetch(`${baseUrl}?${params}`);
    const data = await res.json();
    const { result, message } = data;

    if (message === 'NOTOK') throw new Error(result);

    const [transformedData, count] = await createMany(result);

    return [transformedData, count];
  } catch (e) {
    console.error(`getLiveData: ${e.message}`);
  }
};

module.exports = {
  getLiveData,
};
