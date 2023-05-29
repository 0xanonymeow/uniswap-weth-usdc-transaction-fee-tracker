import { queryFn, useLazyQuery } from '@/lib/clientUtils';
import { QueryKey, UseQueryOptions } from 'react-query';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export const useLazyGetTranasaction = ({
  id,
  page,
  take,
  startDate,
  endDate,
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
  if (take) params.append('take', take);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

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
    data: query?.data as APIResponse<TransformedTransaction>,
    refetch,
  };
};
