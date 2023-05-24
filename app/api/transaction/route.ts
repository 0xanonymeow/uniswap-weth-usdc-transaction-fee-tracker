import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (request: NextRequest) => {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get('id');
  const page = searchParams.get('page') || '1';
  const offset = searchParams.get('offset') || '50';

  try {
    let transactions;

    if (id) {
      transactions = await (
        prisma as PrismaClient
      ).transaction.findFirstOrThrow({
        where: {
          hash: id,
        },
      });
    } else {
      transactions = await (
        prisma as PrismaClient
      ).transaction.findMany({
        orderBy: {
          date: 'desc',
        },
        skip: (Number(page) - 1) * Number(offset),
        take: Number(offset),
      });
    }

    return NextResponse.json({ data: transactions });
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      if (e.code === 'P2025')
        return new Response('Not Found', { status: 404 });
    }
    return new Response('Internal Server Error', { status: 500 });
  }
};
