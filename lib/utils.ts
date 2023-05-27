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
  const usdAmount = (Number(amount) * Number(ethUsd)) / 10 ** 18;
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

export const paginatedResponse = (
  data: [unknown[], number],
  page: number = 1,
  offset: number = 50,
) => {
  const [result, total] = data;
  const lastPage = Math.ceil(total / offset);
  const nextPage = page + 1 > lastPage ? null : page + 1;
  const prevPage = page - 1 < 1 ? null : page - 1;

  return {
    statusCode: 'success',
    data: [...result],
    count: total,
    currentPage: page,
    nextPage,
    prevPage,
    lastPage,
  };
};
