type APIResponse<T> = {
  status: string;
  message: string;
  result: Array<T>;
};

type Transaction = {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  from: string;
  contractAddress: string;
  to: String;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  transactionIndex: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  cumulativeGasUsed: string;
  input: string;
  confirmations: string;
};

type GetTransaction = {
  id?: string;
  page?: string;
  offset?: string;
  startblock?: string;
  endblock?: string;
};
