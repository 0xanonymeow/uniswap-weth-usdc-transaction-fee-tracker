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

type TransformedTransaction = {
  hash: string;
  date: Date;
  from: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  fee: string;
  confirmations: string;
};

type TransformedData = {
  hash: string;
  timeStamp: string;
  from: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  gasUsed: string;
  gasPrice: string;
  confirmations: string;
};

type GetTransaction = {
  id?: string;
  page?: string;
  offset?: string;
  startblock?: string;
  endblock?: string;
};

type GetEventTransactions = {
  page?: string;
  offset?: string;
  sort?: 'asc' | 'desc';
  startBlock?: string;
  endBlock?: string;
};

type DateRange = {
  startDate?: string;
  endDate?: string;
};

type Pagination = {
  page?: number;
  take?: number;
  skip?: numbe;
};
