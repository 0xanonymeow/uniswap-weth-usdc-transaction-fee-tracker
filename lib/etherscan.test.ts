import transactionsFromBlockchain from '@/mock/transactionsFromBlockchain.mock.json';
import { Mock, describe, expect, test, vi } from 'vitest';
import {
  getBlockNumberByHash,
  getBlockNumberByTimestamp,
  getEventTransactions,
} from './etherscan';

global.fetch = vi.fn();

function createFetchResponse(data: unknown) {
  return { json: () => new Promise((resolve) => resolve(data)) };
}

describe('Etherscan Utils', () => {
  test('Should return event transactions with default params', async () => {
    // arrange
    const mockResponse = {
      message: 'OK',
      result: transactionsFromBlockchain,
    };

    (fetch as Mock).mockResolvedValueOnce(
      createFetchResponse(mockResponse),
    );

    // act
    const [result, count] = await getEventTransactions({});

    // assert
    expect(result).toStrictEqual(transactionsFromBlockchain);
    expect(count).toBe(transactionsFromBlockchain.length);
  });
  test('Should return event transactions with startBlock and endBlock', async () => {
    // arrange
    const mockResponse = {
      message: 'OK',
      result: transactionsFromBlockchain,
    };
    const params = {
      page: '1',
      take: '50',
      startBlock: '0',
      endBlock: '10000',
    };

    (fetch as Mock).mockResolvedValueOnce(
      createFetchResponse(mockResponse),
    );

    // act
    const [result, count] = await getEventTransactions(params);

    // assert
    expect(result).toStrictEqual(transactionsFromBlockchain);
    expect(count).toBe(transactionsFromBlockchain.length);
  });
  test('Should return empty response if startBlock or endBlock is invalid', async () => {
    // arrange
    const mockResponse = {
      message: 'No transactions found',
      result: [],
    };
    const params = {
      page: '1',
      take: '50',
      startBlock: 'invalid',
      endBlock: '99999',
    };

    (fetch as Mock).mockResolvedValueOnce(
      createFetchResponse(mockResponse),
    );

    // act
    const [result, count] = await getEventTransactions(params);

    // assert
    expect(result).toStrictEqual([]);
    expect(count).toBe(0);
  });
  test('Should throw an error if getEventTransactions request is rejected by the server', async () => {
    // arrange
    const mockResponse = {
      message: 'NOTOK',
      result: 'Maximum limit reached',
    };

    (fetch as Mock).mockResolvedValueOnce(
      createFetchResponse(mockResponse),
    );

    // act
    const result = await getEventTransactions({});
    expect(result).toStrictEqual([[], 0]);
  });
  test('Should return block number if id is valid', async () => {
    // arrange
    const validId =
      '0x9b4c5f5e9b5b82f01c3126d65679c9949a5fe24679e297adb4cd51cb5af9c9bf';
    const mockResponse = {
      message: 'OK',
      result: transactionsFromBlockchain[0],
    };

    (fetch as Mock).mockResolvedValueOnce(
      createFetchResponse(mockResponse),
    );

    // act
    const result = await getBlockNumberByHash(validId);

    // assert
    expect(result).toStrictEqual('17356784');
  });
  test('Should return 0 if id is invalid', async () => {
    // arrange
    const invalidId = 'invalid';
    const mockResponse = {
      result: null,
    };

    (fetch as Mock).mockResolvedValueOnce(
      createFetchResponse(mockResponse),
    );

    // act
    const result = await getBlockNumberByHash(invalidId);

    // assert
    expect(result).toStrictEqual(0);
  });
  test('Should throw an error if getBlockNumberByHash request is rejected by the server', async () => {
    // arrange
    const blockNumber = '123456';
    const mockResponse = {
      message: 'NOTOK',
      result: 'Maximum limit reached',
    };

    (fetch as Mock).mockResolvedValueOnce(
      createFetchResponse(mockResponse),
    );

    // act
    const result = await getBlockNumberByHash(blockNumber);
    expect(result).toStrictEqual(0);
  });
  test('Should return block number if timestamp is valid', async () => {
    // arrange
    const validTimestamp = '1685268011';
    const mockResponse = {
      message: 'OK',
      result: '17356784',
    };

    (fetch as Mock).mockResolvedValueOnce(
      createFetchResponse(mockResponse),
    );

    // act
    const result = await getBlockNumberByTimestamp(
      validTimestamp,
      'before',
    );

    // assert
    expect(result).toStrictEqual('17356784');
  });

  test('Should return 0 if timestamp is invalid', async () => {
    // arrange
    const invalidTimestamp = '-1';
    const mockResponse = {
      message: 'NOTOK',
      result: 'invalid timestamp',
    };

    (fetch as Mock).mockRejectedValueOnce(
      createFetchResponse(mockResponse),
    );

    // act
    const result = await getBlockNumberByTimestamp(
      invalidTimestamp,
      'before',
    );

    // assert
    expect(result).toStrictEqual(0);
  });
  test('Should thorw an error if getBlockNumberByTimestamp request is rejected by the server', async () => {
    // arrange
    const timestamp = '123456';
    const mockResponse = {
      message: 'NOTOK',
      result: 'Maximum limit reached',
    };

    (fetch as Mock).mockResolvedValueOnce(
      createFetchResponse(mockResponse),
    );

    // act
    const result = await getBlockNumberByTimestamp(
      timestamp,
      'before',
    );
    expect(result).toStrictEqual(0);
  });
});
