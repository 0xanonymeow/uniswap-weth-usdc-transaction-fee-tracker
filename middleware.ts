import { NextResponse } from 'next/server';

export const middleware = async () => {
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  return response;
};

export const config = {
  matcher: '/api/:path*',
};
