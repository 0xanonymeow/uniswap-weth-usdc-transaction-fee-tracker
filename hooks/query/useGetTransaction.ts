import { queryFn, useLazyQuery } from '@/lib/utils';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export const useLazyGetTranasaction = ({
  id,
  page,
  offset,
}: GetTransaction) => {
  const params = new URLSearchParams({});

  if (id) params.append('id', id);
  if (page) params.append('page', page);
  if (offset) params.append('offset', offset);

  const [refetch, query] = useLazyQuery<
    { data: Transaction },
    string
  >(['transaction'], () =>
    queryFn({ url: `${baseUrl}/transaction${params}` }),
  );

  return {
    ...query,
    data: query.data?.data,
    refetch,
  };
};
