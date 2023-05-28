import { queryFn } from '@/lib/clientUtils';
import { get } from 'lodash';
import { useQuery } from 'react-query';

const baseUrl = process.env.NEXT_PUBLIC_COINGECKO_API_BASE_URL;

export const useGetUsdcUsdPrice = () => {
  const { data, ...query } = useQuery(['usdc-usd-price'], () =>
    queryFn({
      url: `${baseUrl}/simple/price?ids=usd-coin&vs_currencies=usd`,
    }),
  );

  return {
    ...query,
    data: get(data, 'usd-coin')?.usd,
  };
};
