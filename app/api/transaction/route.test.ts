import {
  getTotalTokenAmount,
  getTransactionById,
  getTransactions,
  getTransactionsByDate,
  paginatedResponse,
} from '@/lib/serverUtils';
import transactions from '@/mock/transactions.mock.json';
import { NextRequest } from 'next/server';
import { Mock, beforeEach, describe, expect, test, vi } from 'vitest';
import { GET } from './route';

vi.mock('@/lib/serverUtils', async () => ({
  ...((await vi.importActual('@/lib/serverUtils')) as object),
  getTransactions: vi.fn(),
  getTransactionById: vi.fn(),
  getTransactionsByDate: vi.fn(),
  getTotalTokenAmount: vi.fn(),
}));

const baseUrl = process.env.VITE_API_BASE_URL;

describe('Transaction service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('Should return error when startDate is not provided but endDate is provided', async () => {
    // arrange
    const params = new URLSearchParams({
      endDate: new Date().toISOString(),
    });

    // act
    const request = new NextRequest(
      `${baseUrl}/transaction?${params}`,
    );
    const response = await GET(request);
    const { message } = await response.json();

    // assert
    expect(message).toEqual(
      'startDate and endDate must be provided together',
    );
  });
  test('Should return error when startDate is provided but endDate is not provided', async () => {
    // arrange
    const params = new URLSearchParams({
      startDate: new Date().toISOString(),
    });

    // act
    const request = new NextRequest(
      `${baseUrl}/transaction?${params}`,
    );
    const response = await GET(request);
    const { message } = await response.json();

    // assert
    expect(message).toEqual(
      'startDate and endDate must be provided together',
    );
  });
  test('Should return transactions if id is invalid', async () => {
    // arrange
    const id = 'invalid';
    (getTransactionById as Mock).mockRejectedValueOnce(
      new Error('NEXT_NOT_FOUND'),
    );
    const params = new URLSearchParams({
      id,
    });

    // act
    const request = new NextRequest(
      `${baseUrl}/transaction?${params}`,
    );
    const response = await GET(request);
    const { message } = await response.json();

    // assert
    expect(message).toEqual('transaction not found');
  });
  test('Should return transactions if id is valid and date range is not specified', async () => {
    // arrange
    const id =
      '0x9b4c5f5e9b5b82f01c3126d65679c9949a5fe24679e297adb4cd51cb5af9c9bf';
    const mockTransactions = transactions.slice(0, 2);
    const totalETH = 30000000000000000;
    const totalUSDC = 55325862;
    (getTransactionById as Mock).mockResolvedValueOnce([
      mockTransactions,
      mockTransactions.length,
    ]);
    (getTotalTokenAmount as Mock).mockResolvedValueOnce({
      totalETH,
      totalUSDC,
    });
    const params = new URLSearchParams({
      id,
    });

    // act
    const request = new NextRequest(
      `${baseUrl}/transaction?${params}`,
    );
    const response = await GET(request);
    const data = await response.json();

    // assert
    const page = 1;
    const take = 50;

    expect(data).toStrictEqual(
      paginatedResponse({
        data: [mockTransactions, mockTransactions.length],
        page,
        take,
        totalETH,
        totalUSDC,
      }),
    );
  });
  test('Should return transactions if id and date range are valid', async () => {
    // arrange
    const id =
      '0x9b4c5f5e9b5b82f01c3126d65679c9949a5fe24679e297adb4cd51cb5af9c9bf';
    const startDate = '2023-05-28T00:00:00.000Z';
    const endDate = '2023-05-28T23:59:59.000Z';
    const mockTransactions = transactions.slice(0, 2);
    const totalETH = 30000000000000000;
    const totalUSDC = 55325862;
    (getTotalTokenAmount as Mock).mockResolvedValueOnce({
      totalETH,
      totalUSDC,
    });
    (getTransactionById as Mock).mockResolvedValueOnce([
      mockTransactions,
      mockTransactions.length,
    ]);
    const params = new URLSearchParams({
      id,
      startDate,
      endDate,
    });

    // act
    const request = new NextRequest(
      `${baseUrl}/transaction?${params}`,
    );
    const response = await GET(request);
    const data = await response.json();

    // assert
    const page = 1;
    const take = 50;
    expect(data).toStrictEqual(
      paginatedResponse({
        data: [mockTransactions, mockTransactions.length],
        page,
        take,
        totalETH,
        totalUSDC,
      }),
    );
  });
  test('Should return transactions if date range is valid', async () => {
    // arrange
    const startDate = '2023-05-28T00:00:00.000Z';
    const endDate = '2023-05-28T23:59:59.000Z';
    const mockTransactions = transactions.slice(0, 2);
    const totalETH = 30000000000000000;
    const totalUSDC = 55325862;
    (getTotalTokenAmount as Mock).mockResolvedValueOnce({
      totalETH,
      totalUSDC,
    });
    (getTransactionsByDate as Mock).mockResolvedValueOnce([
      mockTransactions,
      mockTransactions.length,
    ]);
    const params = new URLSearchParams({
      startDate,
      endDate,
    });

    // act
    const request = new NextRequest(
      `${baseUrl}/transaction?${params}`,
    );
    const response = await GET(request);
    const data = await response.json();

    // assert
    const page = 1;
    const take = 50;
    expect(data).toStrictEqual(
      paginatedResponse({
        data: [mockTransactions, mockTransactions.length],
        page,
        take,
        totalETH,
        totalUSDC,
      }),
    );
  });
  test('Should return transactions with default filters', async () => {
    // arrange
    const mockTransactions = transactions.slice(0, 2);
    const totalETH = 30000000000000000;
    const totalUSDC = 55325862;
    (getTotalTokenAmount as Mock).mockResolvedValueOnce({
      totalETH,
      totalUSDC,
    });
    (getTransactions as Mock).mockResolvedValueOnce([
      mockTransactions,
      mockTransactions.length,
    ]);

    // act
    const request = new NextRequest(`${baseUrl}/transaction`);
    const response = await GET(request);
    const data = await response.json();

    // assert
    const page = 1;
    const take = 50;
    expect(data).toStrictEqual(
      paginatedResponse({
        data: [mockTransactions, mockTransactions.length],
        page,
        take,
        totalETH,
        totalUSDC,
      }),
    );
  });
  test('Should return error if server error', async () => {
    // arrange
    (getTransactions as Mock).mockRejectedValueOnce(new Error());

    // act
    const request = new NextRequest(`${baseUrl}/transaction`);
    const response = await GET(request);
    const { message } = await response.json();

    // assert
    expect(message).toEqual('Something went wrong, please try again');
  });
});
