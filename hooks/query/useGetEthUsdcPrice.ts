import { queryFn } from '@/lib/utils';
import { useQuery } from 'react-query';

const baseUrl = process.env.NEXT_PUBLIC_BINANCE_API_BASE_URL;

export const useGetEthUsdcPrice = () => {
  const { data, ...query } = useQuery(['eth-usdc-price'], () =>
    queryFn({ url: `${baseUrl}/v3/ticker/price?symbol=ETHUSDC` }),
  );
  return {
    ...query,
    data: data?.price,
  };
};
