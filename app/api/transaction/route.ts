import {
  getTransactionById,
  getTransactions,
  getTransactionsByDate,
  paginatedResponse,
} from '@/lib/serverUtils';
import { filter, reduce } from 'lodash';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (request: NextRequest) => {
  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get('page') || '1');
  const take = Number(searchParams.get('take') || '50');

  const skip = (Number(page) - 1) * Number(take);

  const id = searchParams.get('id');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const forceRefresh = searchParams.get('forceRefresh') === 'true';

  if ((startDate && !endDate) || (!startDate && endDate)) {
    return NextResponse.json(
      {
        message: 'startDate and endDate must be provided together',
      },
      {
        statusText: 'Bad Request',
        status: 400,
      },
    );
  }

  const date: DateRange = {};

  if (startDate && endDate) {
    date.startDate = startDate;
    date.endDate = endDate;
  }

  try {
    let result: [TransformedTransaction[], number] = [[], 0];

    if (id) {
      result = await getTransactionById(id, date, forceRefresh, {
        page,
        take,
        skip,
      });
    } else if (date.startDate && date.endDate)
      result = await getTransactionsByDate(date, forceRefresh, {
        page,
        take,
        skip,
      });
    else if (!date.startDate && !date.endDate)
      result = await getTransactions({ page, take, skip });

    const totalETH =
      reduce(
        filter(
          result[0],
          ({ tokenSymbol }) => tokenSymbol === 'WETH',
        ),
        (acc, cur) => Number(acc) + Number(cur.value),
        0,
      ) /
      10 ** 18;
    const totalUSDC =
      reduce(
        filter(
          result[0],
          ({ tokenSymbol }) => tokenSymbol === 'USDC',
        ),
        (acc, cur) => acc + Number(cur.value),
        0,
      ) /
      10 ** 12;

    return NextResponse.json(
      paginatedResponse({
        data: result,
        totalETH,
        totalUSDC,
        page,
        take,
      }),
    );
  } catch (e) {
    if ((e as Error).message === 'NEXT_NOT_FOUND')
      return NextResponse.json(
        {
          message: 'transaction not found',
        },
        {
          statusText: 'Not Found',
          status: 404,
        },
      );
    return NextResponse.json(
      {
        message: 'Something went wrong, please try again',
      },
      {
        statusText: 'Internal Server Error',
        status: 500,
      },
    );
  }
};
