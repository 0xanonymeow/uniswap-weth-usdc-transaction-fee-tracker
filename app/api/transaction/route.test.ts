import { describe, expect, test, vi } from 'vitest';
import mockData from './mockData.json';

const baseUrl = process.env.VITE_API_BASE_URL;

const mockFetch = vi.fn().mockImplementation(global.fetch);

const createFetchResponse = (data: unknown) => ({
  json: () => new Promise((resolve) => resolve(data)),
});

describe('Transaction service', () => {
  test('Should return transactions with default filters', async () => {
    /* default filters are
      {
        page: 1,
        take: 50,
      }
    */

    // arrange
    mockFetch.mockResolvedValue(createFetchResponse(mockData));

    // act
    const response = await mockFetch(`${baseUrl}/transaction`);
    const data = await response.json();

    // assert
    expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/transaction`);
    expect(data).toStrictEqual(mockData);
    expect(data.currentPage).toEqual(1);
    expect(data.take).toEqual(50);
  });
  test.todo(
    'Should return transactions with specified id from db if collected',
  );
  test.todo(
    'Should return transactions with specified id from blockchain if forceRefresh and collected',
  );
  test.todo(
    'Should return transactions with specified id from blockchain if forceRefresh and not collected',
  );
  test.todo(
    'Should return transactions with specified id from blockchain if not collected',
  );

  test.todo(
    'Should return transactions with specified date range from db if collected',
  );
  test.todo(
    'Should return transactions with specified date range from blockchain if forceRefresh and collected',
  );
  test.todo(
    'Should return transactions with specified date range from blockchain if forceRefresh and not collected',
  );
  test.todo(
    'Should return transactions with specified date range from blockchain if startDate not collected',
  );
  test.todo(
    'Should return transactions with specified date range from blockchain if endDate not collected',
  );
  test.todo(
    'Should return transactions with specified date range from blockchain if not collected',
  );

  test.todo(
    'Should return transactions with specified id and date range from db if collected',
  );
  test.todo(
    'Should return transactions with specified id and date range from blockchain if forceRefresh and collected',
  );
  test.todo(
    'Should return transactions with specified id and date range from blockchain if forceRefresh and not collected',
  );
  test.todo(
    'Should return transactions with specified id and date range from blockchain if not collected',
  );

  test.todo(
    'Should return transactions with nextPage, prevPage, and lastPage if viable',
  );

  test.todo('Should return no transactions if id is invalid');
  test.todo('Should return no transactions if date range is invalid');

  test.todo('Should return error if date range is incomplete');
});
