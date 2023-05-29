'use client';

import type {
  QueryFunction,
  QueryKey,
  UseQueryOptions,
  useQuery as useQueryType,
} from 'react-query';
import { useQuery } from 'react-query';

type UseQueryParams = Parameters<typeof useQueryType>;

export const useLazyQuery = <TData, TError>(
  key: UseQueryParams[0],
  fetchFn: QueryFunction<TData, QueryKey>,
  options?: Omit<
    UseQueryOptions<TData, TError, unknown, QueryKey>,
    'queryKey' | 'queryFn'
  >,
) => {
  const query = useQuery<TData, TError, unknown, QueryKey>(
    key,
    fetchFn,
    {
      ...(options || {}),
      enabled: false,
    },
  );

  return [query.refetch, query] as const;
};

export const queryFn = async ({
  url,
  options,
}: {
  url: string;
  options?: RequestInit;
}) => fetch(url, options).then((res) => res.json());

export const getFeeInUsd = (amount: string, ethUsd: string) => {
  const usdAmount = (Number(amount) * Number(ethUsd)) / 10 ** 9;
  return usdAmount.toFixed(2);
};

export const getValueInUsd = (
  amount: string,
  tokenDecimal: string,
  tokenSymbol: string,
  priceInsd: { [key: string]: string },
) => {
  const usdAmount =
    (Number(amount) * Number(priceInsd[tokenSymbol])) /
    10 ** Number(tokenDecimal);

  return usdAmount.toFixed(2);
};
