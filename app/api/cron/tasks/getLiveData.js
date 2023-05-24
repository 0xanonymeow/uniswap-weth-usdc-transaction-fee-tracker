// @ts-nocheck

const {
  UNISWAP_WETH_USDC_PAIR_CONTRACT_ADDRESS,
} = require('../../../../constants/contracts');
const prisma = require('../../../../lib/prisma');
const { map } = require('lodash');

const getLiveData = async (
  page = '1',
  offset = '100',
  sort = 'desc',
) => {
  const baseUrl = process.env.ETHERSCAN_BASE_URL;
  const params = new URLSearchParams({
    module: 'account',
    action: 'tokentx',
    address: UNISWAP_WETH_USDC_PAIR_CONTRACT_ADDRESS,
    page,
    offset,
    sort,
  });
  const apiKey = process.env.ETHERSCAN_API_KEY;
  if (apiKey) params.append('apikey', apiKey); // if apiKey is undefined, rate limit of 1 request per 5 seconds will be applied
  const res = await fetch(`${baseUrl}?${params}`);
  const data = await res.json();
  const { result } = data;

  const transformedData = map(
    result,
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
      fee: String(BigInt(gasUsed) * BigInt(gasPrice)),
      confirmations,
    }),
  ).filter(({ confirmations }) => Number(confirmations) > 0);
  const { count } = await prisma.transaction.createMany({
    data: transformedData,
    skipDuplicates: true,
  });
  return count;
};

module.exports = {
  getLiveData,
};
