import prisma from '@/lib/prisma';
import { filter, map, reduce } from 'lodash';
import { notFound } from 'next/navigation';
import {
  getBlockNumberByHash,
  getBlockNumberByTimestamp,
  getEventTransactions,
} from './etherscan';

export const paginatedResponse = ({
  data,
  totalETH,
  totalUSDC,
  page = 1,
  take = 50,
}: PaginatedResponse) => {
  const [result, total] = data;
  const lastPage = Math.ceil(total / take);
  const nextPage = page + 1 > lastPage ? null : page + 1;
  const prevPage = page - 1 < 1 ? null : page - 1;

  return {
    data: [...result],
    take,
    count: total,
    currentPage: page,
    nextPage,
    prevPage,
    lastPage,
    totalETH,
    totalUSDC,
  };
};

export const checkIfDateExist = async (date: DateRange) => {
  if (!date.startDate || !date.endDate) return [null, null];

  return prisma.$transaction([
    prisma.transaction.findFirst({
      where: {
        date: date.startDate,
      },
    }),
    prisma.transaction.findFirst({
      where: {
        date: date.endDate,
      },
    }),
  ]);
};

export const transformData = (
  data: Transaction[],
): TransformedTransaction[] =>
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
    }: Transaction) => ({
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

export const createMany = async (
  result: Transaction[],
): Promise<[TransformedTransaction[], number]> => {
  const transformedData = transformData(result);

  const { count } = await prisma.transaction.createMany({
    data: transformedData,
    skipDuplicates: true,
  });

  if (count) console.log(`inserted ${count} records`);

  return [transformedData, transformedData.length];
};

export const getTransactions = async (
  pagination?: Pagination,
): Promise<[TransformedTransaction[], number]> => {
  const [result, count] = await prisma.$transaction([
    prisma.transaction.findMany({
      orderBy: {
        date: 'desc',
      },
      take: pagination?.take,
      skip: pagination?.skip,
    }),
    prisma.transaction.count(),
  ]);
  if (result.length) return [result, count];

  return notFound();
};

export const getTransactionById = async (
  id: string,
  date: DateRange,
  forceRefresh?: boolean,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  pagination?: Pagination,
): Promise<[TransformedTransaction[], number]> => {
  if (!date.startDate && !date.endDate) {
    const result = await prisma.transaction.findMany({
      // find transactions in the db
      where: {
        hash: id,
      },
    });
    if (result.length) return [result, result ? result.length : 0];
  }

  if (!forceRefresh) {
    const [startDate, endDate] = await checkIfDateExist(date);

    // if both startDate and endDate exist in the db
    if (startDate && endDate) {
      const transactions = await prisma.transaction.findMany({
        where: {
          date: {
            gte: startDate.date,
            lte: endDate.date,
          },
          hash: id,
        },
      });

      const result = filter(transactions, ({ hash }) => hash === id);

      if (result.length) return [result, result ? result.length : 0];
    }
  }

  const blockNumberData = getBlockNumberByHash(id);
  const startBlockData = getBlockNumberByTimestamp(
    date.startDate!,
    'after',
  );
  const endBlockData = getBlockNumberByTimestamp(
    date.endDate!,
    'before',
  );

  const [blockNumber, startBlock, endBlock] = await Promise.all([
    blockNumberData,
    startBlockData,
    endBlockData,
  ]);

  if (startBlock <= blockNumber && blockNumber <= endBlock) {
    const [result] = await getEventTransactions({
      // if not, find the event transactions from the blockchain
      page: '1',
      offset: '10000',
      startBlock,
      endBlock,
    });
    const transactions = filter(result, ({ hash }) => hash === id);

    const [transformedData, count] = await createMany(transactions);

    return [transformedData, count];
  }

  return notFound();
};

export const getTransactionsByDate = async (
  date: DateRange,
  forceRefresh?: boolean,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  pagination?: Pagination,
): Promise<[TransformedTransaction[], number]> => {
  if (!forceRefresh) {
    const [startDate, endDate] = await checkIfDateExist(date);

    // if both startDate and endDate exist in the db
    if (startDate && endDate) {
      const result = await prisma.transaction.findMany({
        where: {
          date: {
            gte: startDate.date,
            lte: endDate.date,
          },
        },
      });
      if (result.length) return [result, result ? result.length : 0];
    }
  }

  const startBlockData = getBlockNumberByTimestamp(
    date.startDate!,
    'after',
  );
  const endBlockData = getBlockNumberByTimestamp(
    date.endDate!,
    'before',
  );

  const [startBlock, endBlock] = await Promise.all([
    startBlockData,
    endBlockData,
  ]);

  if (startBlock && endBlock) {
    const [result] = await getEventTransactions({
      // if not, find the event transactions from the blockchain
      page: '1',
      offset: '10000',
      startBlock,
      endBlock,
    });

    const [transformedData, count] = await createMany(result);
    return [transformedData, count];
  }

  return notFound();
};

export const getTotalTokenAmount = (
  transactions: TransformedTransaction[],
) => {
  const totalETH = reduce(
    filter(transactions, ({ tokenSymbol }) => tokenSymbol === 'WETH'),
    (acc, cur) => Number(acc) + Number(cur.value),
    0,
  );
  const totalUSDC = reduce(
    filter(transactions, ({ tokenSymbol }) => tokenSymbol === 'USDC'),
    (acc, cur) => acc + Number(cur.value),
    0,
  );

  return {
    totalETH,
    totalUSDC,
  };
};
