import prisma from '@/lib/prisma';
import { filter, map } from 'lodash';
import { notFound } from 'next/navigation';
import {
  getBlockNumberByHash,
  getBlockNumberByTimestamp,
  getEventTransactions,
} from './etherscan';

export const paginatedResponse = (
  data: [unknown[], number],
  page: number = 1,
  take: number = 50,
) => {
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
  };
};

export const checkIfDateExist = async (date: DateRange) => {
  if (!date.startDate || !date.endDate) return [null, null];

  const startDate = new Date(date.startDate!);
  const endDate = new Date(date.endDate!);
  const startDateHours = (`0${  startDate.getHours()}`).slice(-2);
  const startDateMinutes = (
    `0${  String(Number(startDate.getMinutes()) + 1)}`
  ).slice(-2);

  const endDateHours = (`0${  endDate.getHours()}`).slice(-2);
  const endDateMinutes = (
    `0${  String(Number(endDate.getMinutes() - 1))}`
  ).slice(-2);

  const startDateOffset = `T${
    `${startDateHours  }:${  startDateMinutes}`
  }:00.000Z`;
  const endDateOffset = `T${
    `${endDateHours  }:${  endDateMinutes}`
  }:00.000Z`;

  return prisma.$transaction([
    prisma.transaction.findFirst({
      where: {
        date: {
          gte: date.startDate,
          lte: `${date.startDate?.split('T')?.[0]}${startDateOffset}`,
        },
      },
    }),
    prisma.transaction.findFirst({
      where: {
        date: {
          gte: `${date.endDate?.split('T')?.[0]}${endDateOffset}`,
          lte: date.endDate,
        },
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

  const blockNumber = await getBlockNumberByHash(id);
  if (blockNumber) {
    const [result] = await getEventTransactions({
      // if not, find the event transactions from the blockchain
      page: '1',
      offset: '10000',
      startBlock: blockNumber,
      endBlock: blockNumber,
    });

    // eslint-disable-next-line @typescript-eslint/no-shadow
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
