import {
  UNISWAP_WETH_USDC_PAIR_CONTRACT_ADDRESS,
  USDC_CONTRACT_ADDRESS,
} from '@/constants/contracts';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (request: NextRequest) => {
  const baseUrl = process.env.ETHERSCAN_BASE_URL;

  const { searchParams } = request.nextUrl;

  const page = searchParams.get('page') || '1';
  const offset = searchParams.get('offset') || '100';
  const sort = searchParams.get('sort') || 'desc';

  const params = new URLSearchParams({
    module: 'account',
    action: 'tokentx',
    address: UNISWAP_WETH_USDC_PAIR_CONTRACT_ADDRESS,
    contractaddress: USDC_CONTRACT_ADDRESS,
    page,
    offset,
    sort,
  });

  const apiKey = process.env.ETHERSCAN_API_KEY;
  if (apiKey) params.append('apikey', apiKey); // if apiKey is undefined, rate limit of 1 request per 5 seconds will be applied

  const res = await fetch(`${baseUrl}?${params}`);
  const data: APIResponse<Transaction> = await res.json();

  return NextResponse.json(data);
};
