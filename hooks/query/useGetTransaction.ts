import { queryFn, useLazyQuery } from '@/lib/clientUtils';
import { QueryKey, UseQueryOptions } from 'react-query';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export const useLazyGetTranasaction = ({
  id,
  page,
  offset,
  startblock,
  endblock,
  options,
}: GetTransaction & {
  options?: Omit<
    UseQueryOptions<{ data: Transaction }, string, unknown, QueryKey>,
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
    data: (query.data as { data: Transaction }).data,
    refetch,
  };
};
