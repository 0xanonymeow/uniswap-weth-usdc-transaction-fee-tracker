import transactions from '@/mock/transactions.mock.json';
import transactionsFromBlockchain from '@/mock/transactionsFromBlockchain.mock.json';
import { map } from 'lodash';
import { Mock, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  getBlockNumberByHash,
  getBlockNumberByTimestamp,
  getEventTransactions,
} from './etherscan';
import {
  checkIfDateExist,
  createMany,
  getTransactionById,
  getTransactions,
  getTransactionsByDate,
} from './serverUtils';

vi.mock('@/lib/etherscan', async () => ({
  ...((await vi.importActual('@/lib/etherscan')) as object),
  getBlockNumberByTimestamp: vi.fn(),
  getBlockNumberByHash: vi.fn(),
  getEventTransactions: vi.fn(),
}));

describe('Server Utils', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  test('Should return transactions when id is valid when date range is not provided', async () => {
    // arrange
    const existingId =
      '0x9b4c5f5e9b5b82f01c3126d65679c9949a5fe24679e297adb4cd51cb5af9c9bf';
    const mockTransactions = transactions.slice(0, 2);
    vi.spyOn(prisma.transaction, 'findMany').mockResolvedValueOnce(
      mockTransactions,
    );

    // act
    const [result, count] = await getTransactionById(existingId, {});

    // assert
    expect(result).toStrictEqual(mockTransactions);
    expect(count).toEqual(2);
  });
  test('Should not return transactions when is is invalid when date range is not provided', async () => {
    // arrange
    const invalidId = 'invalid';
    vi.spyOn(prisma.transaction, 'findMany').mockResolvedValueOnce(
      [],
    );
    vi.spyOn(prisma, '$transaction').mockResolvedValueOnce([
      null,
      null,
    ]);
    (getBlockNumberByHash as Mock).mockResolvedValueOnce(0);

    // act
    try {
      await getTransactionById(invalidId, {});
    } catch (e) {
      // assert
      expect((e as Error).message).toEqual('NEXT_NOT_FOUND');
    }
  });
  test('Should return transactions when id and date range are valid', async () => {
    // arrange
    const existingId =
      '0x9b4c5f5e9b5b82f01c3126d65679c9949a5fe24679e297adb4cd51cb5af9c9bf';
    const mockTransactions = transactions.slice(0, 2);
    const startDate = new Date().toISOString();
    const endDate = new Date().toISOString();

    vi.mock('@/lib/serverUtils', async () => ({
      ...((await vi.importActual('@/lib/serverUtils')) as object),
      checkIfDateExist: vi.fn(),
    }));
    vi.spyOn(prisma, '$transaction').mockResolvedValueOnce([
      mockTransactions[0],
      mockTransactions[1],
    ]);
    (checkIfDateExist as Mock).mockResolvedValue([
      mockTransactions[0],
      mockTransactions[1],
    ]);
    vi.spyOn(prisma.transaction, 'findMany').mockResolvedValueOnce(
      mockTransactions,
    );

    // act
    const [result, count] = await getTransactionById(existingId, {
      startDate,
      endDate,
    });

    // assert
    expect(result).toEqual(mockTransactions);
    expect(count).toEqual(2);
  });
  test('Should save and return transactions from blockchain when id is valid but not in db and date range is not provided', async () => {
    // arrange
    const validId =
      '0x9b4c5f5e9b5b82f01c3126d65679c9949a5fe24679e297adb4cd51cb5af9c9bf';
    const mockTransactions = transactions.slice(0, 2);
    vi.spyOn(prisma.transaction, 'findMany').mockResolvedValueOnce(
      [],
    );
    vi.mock('@/lib/serverUtils', async () => ({
      ...((await vi.importActual('@/lib/serverUtils')) as object),
      checkIfDateExist: vi.fn(),
      createMany: vi.fn(),
    }));
    (checkIfDateExist as Mock).mockResolvedValueOnce([null, null]);
    (getBlockNumberByHash as Mock).mockResolvedValueOnce('17356784');
    (getEventTransactions as Mock).mockResolvedValueOnce([
      transactionsFromBlockchain,
      transactionsFromBlockchain.length,
    ]);
    vi.spyOn(prisma.transaction, 'createMany').mockResolvedValueOnce([
      mockTransactions,
      mockTransactions.length,
    ]);
    (createMany as Mock).mockResolvedValueOnce([
      mockTransactions,
      mockTransactions.length,
    ]);

    // act
    const [response, count] = await getTransactionById(validId, {});

    // assert
    const result = map(response, ({ date, ...rest }) => ({
      ...rest,
      date: new Date(date).toISOString(),
    }));
    expect(result).toEqual(mockTransactions);
    expect(count).toEqual(count);
  });
  test('Should save and return transactions from blockchain when id is valid but not in db and date range is provided', async () => {
    // arrange
    const validId =
      '0x9b4c5f5e9b5b82f01c3126d65679c9949a5fe24679e297adb4cd51cb5af9c9bf';
    const mockTransactions = transactions.slice(0, 2);
    const startDate = new Date().toISOString();
    const endDate = new Date().toISOString();

    vi.mock('@/lib/serverUtils', async () => ({
      ...((await vi.importActual('@/lib/serverUtils')) as object),
      checkIfDateExist: vi.fn(),
      createMany: vi.fn(),
    }));
    vi.spyOn(prisma, '$transaction').mockResolvedValueOnce([
      null,
      null,
    ]);
    (checkIfDateExist as Mock).mockResolvedValueOnce([null, null]);
    (getBlockNumberByHash as Mock).mockResolvedValueOnce('17356784');
    (getBlockNumberByTimestamp as Mock).mockResolvedValue('17356784');
    (getEventTransactions as Mock).mockResolvedValueOnce([
      transactionsFromBlockchain,
      transactionsFromBlockchain.length,
    ]);
    vi.spyOn(prisma.transaction, 'createMany').mockResolvedValueOnce({
      count: transactionsFromBlockchain.length,
    });
    (createMany as Mock).mockResolvedValueOnce([
      mockTransactions,
      mockTransactions.length,
    ]);

    // act
    const [response, count] = await getTransactionById(validId, {
      startDate,
      endDate,
    });

    // assert
    const result = map(response, ({ date, ...rest }) => ({
      ...rest,
      date: new Date(date).toISOString(),
    }));
    expect(result).toEqual(mockTransactions);
    expect(count).toEqual(count);
  });
  test('Should return transactions from db', async () => {
    // arrange
    const mockTransactions = transactions.slice(0, 2);
    vi.spyOn(prisma, '$transaction').mockResolvedValueOnce([
      mockTransactions,
      mockTransactions.length,
    ]);
    vi.spyOn(prisma.transaction, 'findMany').mockResolvedValueOnce(
      mockTransactions,
    );

    // act
    const [result, count] = await getTransactions();

    // assert
    expect(result).toEqual(mockTransactions);
    expect(count).toEqual(mockTransactions.length);
  });
  test('Should not return transactions from db', async () => {
    // arrange
    vi.spyOn(prisma, '$transaction').mockResolvedValueOnce([[], 0]);
    vi.spyOn(prisma.transaction, 'findMany').mockResolvedValueOnce(
      [],
    );

    // act
    try {
      await getTransactions();
    } catch (e) {
      // assert
      expect((e as Error).message).toEqual('NEXT_NOT_FOUND');
    }
  });
  test('Shoud return transactions if id is not provided and date range is valid', async () => {
    // arrange
    const mockTransactions = transactions.slice(0, 2);
    const startDate = new Date().toISOString();
    const endDate = new Date().toISOString();

    vi.spyOn(prisma, '$transaction').mockResolvedValueOnce([
      mockTransactions[0],
      mockTransactions[1],
    ]);
    vi.spyOn(prisma.transaction, 'findFirst')
      .mockResolvedValueOnce(mockTransactions[0])
      .mockResolvedValueOnce(mockTransactions[1]);

    vi.spyOn(prisma.transaction, 'findMany').mockResolvedValueOnce(
      mockTransactions,
    );

    // act
    const [result, count] = await getTransactionsByDate({
      startDate,
      endDate,
    });

    // assert
    expect(result).toStrictEqual(mockTransactions);
    expect(count).toEqual(mockTransactions.length);
  });
  test('Shoud return transactions from blockchain if id is not provided and date range is valid', async () => {
    // arrange
    const mockTransactions = transactions.slice(0, 2);
    const startDate = new Date().toISOString();
    const endDate = new Date().toISOString();

    (checkIfDateExist as Mock).mockReturnValueOnce([null, null]);
    vi.spyOn(prisma, '$transaction').mockResolvedValueOnce([
      null,
      null,
    ]);
    vi.spyOn(prisma.transaction, 'findFirst')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    vi.spyOn(prisma.transaction, 'findMany').mockResolvedValueOnce(
      [],
    );

    (getBlockNumberByTimestamp as Mock)
      .mockResolvedValueOnce('17356784')
      .mockResolvedValueOnce('17356784');
    (getEventTransactions as Mock).mockResolvedValueOnce([
      transactionsFromBlockchain,
      transactionsFromBlockchain.length,
    ]);
    (createMany as Mock).mockResolvedValueOnce([
      mockTransactions,
      mockTransactions.length,
    ]);
    vi.spyOn(prisma.transaction, 'createMany').mockResolvedValueOnce({
      count: mockTransactions.length,
    });

    // act
    const [result, count] = await getTransactionsByDate({
      startDate,
      endDate,
    });

    // assert
    const tranasctions = map(result, ({ date, ...rest }) => ({
      ...rest,
      date: new Date(date).toISOString(),
    }));
    expect(tranasctions).toStrictEqual(mockTransactions);
    expect(count).toEqual(mockTransactions.length);
  });
  test('Shoud not return transactions if id is not provided and date range is invalid', async () => {
    // arrange
    const startDate = new Date().toISOString();
    const endDate = new Date().toISOString();

    (checkIfDateExist as Mock).mockReturnValueOnce([null, null]);
    vi.spyOn(prisma, '$transaction').mockResolvedValueOnce([
      null,
      null,
    ]);
    vi.spyOn(prisma.transaction, 'findFirst')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    vi.spyOn(prisma.transaction, 'findMany').mockResolvedValueOnce(
      [],
    );

    await (getBlockNumberByTimestamp as Mock)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);

    // act
    try {
      await getTransactionsByDate({
        startDate,
        endDate,
      });
    } catch (e) {
      expect((e as Error).message).toEqual('NEXT_NOT_FOUND');
    }
  });
});
