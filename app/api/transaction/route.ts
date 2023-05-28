import {
  getTransactionById,
  getTransactions,
  getTransactionsByDate,
  paginatedResponse,
} from '@/lib/serverUtils';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { notFound } from 'next/navigation';
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

    if (id)
      result = await getTransactionById(id, date, forceRefresh, {
        page,
        take,
        skip,
      });
    else if (date.startDate && date.endDate)
      result = await getTransactionsByDate(date, forceRefresh, {
        page,
        take,
        skip,
      });
    else if (!date.startDate && !date.endDate)
      result = await getTransactions({ page, take, skip });

    return NextResponse.json(paginatedResponse(result, page, take));
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      if (e.code === 'P2025') return notFound();
    }
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
