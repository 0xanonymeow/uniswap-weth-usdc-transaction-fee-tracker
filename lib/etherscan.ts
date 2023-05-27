import { UNISWAP_WETH_USDC_PAIR_CONTRACT_ADDRESS } from '@/constants/contracts';
import prisma from '@/lib/prisma';
import { isString, map } from 'lodash';

const baseUrl = process.env.ETHERSCAN_BASE_URL;
const apiKey = process.env.ETHERSCAN_API_KEY; // if apiKey is undefined, rate limit of 1 request per 5 seconds will be applied

export const getEventTransactions = async ({
  page = '1',
  offset = '1000',
  sort = 'desc',
  startBlock,
  endBlock,
}: GetErc20TokenTransferEvent): Promise<
  [TransformedTransaction[], number]
> => {
  const params = new URLSearchParams({
    module: 'account',
    action: 'tokentx',
    address: UNISWAP_WETH_USDC_PAIR_CONTRACT_ADDRESS,
    page,
    offset,
    sort,
  });

  if (startBlock) params.append('startblock', startBlock);
  if (endBlock) params.append('endblock', endBlock);
  if (apiKey) params.append('apikey', apiKey);

  try {
    const res = await fetch(`${baseUrl}?${params}`);
    const data = await res.json();
    const { result } = data;

    if (isString(result)) throw new Error(result);

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
        fee: String((Number(gasUsed) * Number(gasPrice)) / 10 ** 9), // gasPrice is denoted in gwei, convert it to eth for later calculation
        confirmations,
      }),
    ).filter(({ confirmations }) => Number(confirmations) > 0);

    const { count } = await prisma.transaction.createMany({
      data: transformedData,
      skipDuplicates: true,
    });
    console.log(`inserted ${count} records`);
    return [transformedData, count];
  } catch (e) {
    console.error((e as Error).message);
  }
  return [[], 0];
};

export const getBlockNumberByHash = async (id: string) => {
  const params = new URLSearchParams({
    module: 'proxy',
    action: 'eth_getTransactionByHash',
    txhash: id,
  });

  if (apiKey) params.append('apikey', apiKey);

  try {
    const res = await fetch(`${baseUrl}?${params}`);
    const data = await res.json();
    const { result } = data;

    if (isString(result)) throw new Error(result);

    return result?.blockNumber.toString(10);
  } catch (e) {
    console.error((e as Error).message);
  }
  return 0;
};

export const getBlockNumberByTimestamp = async (
  timestamp: string,
  closest: 'before' | 'after',
) => {
  const params = new URLSearchParams({
    module: 'block',
    action: 'getblocknobytime',
    timestamp,
    closest,
  });

  if (apiKey) params.append('apikey', apiKey);

  try {
    const res = await fetch(`${baseUrl}?${params}`);
    const data = await res.json();
    const { result } = data;

    if (isString(result)) throw new Error(result);

    return result;
  } catch (e) {
    console.error((e as Error).message);
  }
  return 0;
};
