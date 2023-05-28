import {
  ETHERSCAN_API_KEY,
  ETHERSCAN_BASE_URL,
  UNISWAP_WETH_USDC_PAIR_CONTRACT_ADDRESS,
} from '@/constants';

export const getEventTransactions = async ({
  page = '1',
  offset = '10000',
  sort = 'desc',
  startBlock,
  endBlock,
}: GetEventTransactions): Promise<[Transaction[], number]> => {
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
  if (ETHERSCAN_API_KEY) params.append('apikey', ETHERSCAN_API_KEY);

  try {
    const res = await fetch(`${ETHERSCAN_BASE_URL}?${params}`);
    const data = await res.json();
    const { result, message } = data;

    if (message === 'NOTOK') throw new Error(result);

    return [result, result ? result.length : 0];
  } catch (e) {
    console.error(`getEventTransactions: ${(e as Error).message}`);
  }
  return [[], 0];
};

export const getBlockNumberByHash = async (id: string) => {
  const params = new URLSearchParams({
    module: 'proxy',
    action: 'eth_getTransactionByHash',
    txhash: id,
  });

  if (ETHERSCAN_API_KEY) params.append('apikey', ETHERSCAN_API_KEY);

  try {
    const res = await fetch(`${ETHERSCAN_BASE_URL}?${params}`);
    const data = await res.json();
    const { result, message } = data;

    if (message === 'NOTOK') throw new Error(result);

    return Number(result?.blockNumber).toString(10);
  } catch (e) {
    console.error(`getBlockNumberByHash: ${(e as Error).message}`);
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
    timestamp: String(Date.parse(timestamp) / 1000),
    closest,
  });

  if (ETHERSCAN_API_KEY) params.append('apikey', ETHERSCAN_API_KEY);

  try {
    const res = await fetch(`${ETHERSCAN_BASE_URL}?${params}`);
    const data = await res.json();
    const { result, message } = data;

    if (message === 'NOTOK') throw new Error(result);

    return result;
  } catch (e) {
    console.error(
      `getBlockNumberByTimestamp: ${(e as Error).message}`,
    );
  }
  return 0;
};
