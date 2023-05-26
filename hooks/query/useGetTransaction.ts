import { queryFn, useLazyQuery } from '@/lib/utils';
import { QueryKey, UseQueryOptions } from 'react-query';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export const useLazyGetTranasaction = <TData, TError>({
  id,
  page,
  offset,
  startblock,
  endblock,
  options,
}: GetTransaction & {
  options?: Omit<
    UseQueryOptions<TData, TError, unknown, QueryKey>,
    'queryKey' | 'queryFn'
  >;
}) => {
  const params = new URLSearchParams({});

  if (id) params.append('id', id);
  if (page) params.append('page', page);
  if (offset) params.append('offset', offset);
  if (startblock) params.append('startblock', startblock);
  if (endblock) params.append('endblock', endblock);

  const [refetch, query] = useLazyQuery<
    { data: Transaction },
    string
  >(
    ['transaction'],
    () => queryFn({ url: `${baseUrl}/transaction?${params}` }),
    options,
  );

  return {
    ...query,
    data: query.data?.data,
    refetch,
  };
};
