'use client';

import { useGetEthUsdcPrice } from '@/hooks/query/useGetEthUsdcPrice';
import { useLazyGetTranasaction } from '@/hooks/query/useGetTransaction';
import { useGetUsdcUsdPrice } from '@/hooks/query/useGetUsdcUsdPrice';
import { getFeeInUsd, getValueInUsd } from '@/lib/utils';
import { Magnifier } from '@/public/icons/magnifier';
import { isEmpty, isUndefined, map } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { useTransaction } from 'wagmi';

function App() {
  const [params, setParams] = useState<GetTransaction>({
    id: '',
    page: '1',
    offset: '50',
  });
  const [isSearching, setIsSearching] = useState(false);

  const {
    data: getTransactionData,
    // isLoading: isGetTransactionLoading,
    isError: isGetTransactionError,
    refetch: refetchGetTransaction,
  } = useLazyGetTranasaction({
    ...params,
    options: {
      onSettled: () => setIsSearching(false),
      refetchOnWindowFocus: false,
    },
  });

  const {
    data: transaction,
    refetch: refetchTransaction,
    isError: isTransactionError,
    isSuccess: isTransactionSuccess,
  } = useTransaction({
    hash: params?.id,
    enabled: false,
    onSettled: () => setIsSearching(false),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!isEmpty(getTransactionData)) return;
    if (!isUndefined(transaction)) {
      const { blockNumber } = transaction;
      setParams({
        ...params,
        startblock: Number(blockNumber),
        endblock: Number(blockNumber),
      });
    }
  }, [isSearching, getTransactionData, transaction, params]);

  const {
    data: price,
    // isLoading: isGetEthUsdcPriceLoading
  } = useGetEthUsdcPrice();
  const {
    data: usdcUsd,
    // isLoading: isGetUsdcUsdPriceLoading
  } = useGetUsdcUsdPrice();

  const priceInUsd = useMemo(
    () => ({ WETH: price, USDC: usdcUsd }),
    [price, usdcUsd],
  );

  const onSearch = () => {
    setIsSearching(true);
    refetchGetTransaction({
      throwOnError: false,
      cancelRefetch: true,
    });
  };

  const onTxNotFound = () => {
    if (!isSearching) return;
    refetchTransaction({ throwOnError: false, cancelRefetch: true });
  };

  useEffect(() => {
    if (!isSearching || !params?.id) return;
    if (isEmpty(getTransactionData)) onTxNotFound();
  }, [getTransactionData, params, isSearching]);

  useEffect(() => {
    if (isTransactionSuccess && params?.startblock) {
      refetchGetTransaction();
    }
    if (isTransactionError) {
    }
  }, [isTransactionError, isTransactionSuccess, params]);

  return (
    <main className="min-h-screen min-w-screen">
      <div className="p-32 flex flex-col justify-center">
        <div className="w-full flx gap-2 flex align-middle justify-center">
          <input
            className="w-1/2 h-8 rounded-md px-4 dark:text-black"
            value={params.id}
            onChange={(e) =>
              setParams({ ...params, id: e.target.value })
            }
            placeholder="0x3d4f354..."
          />
          <button
            type="button"
            onClick={onSearch}
            className="w-8 h-8"
          >
            <Magnifier />
          </button>
        </div>
        <div className="w-full mt-16 flex flex-col align-middle justify-center">
          <table className="w-full text-white dark:text-slate-800">
            <thead
              className="text-center bg-slate-600 dark:bg-slate-400"
              style={{
                borderRadius: 4,
              }}
            >
              <tr className="text-white">
                <th>id</th>
                <th>fee</th>
                <th>date</th>
                <th>executed price</th>
                <th>token</th>
              </tr>
            </thead>
            <tbody className="text-end dark:bg-slate-100 bg-slate-500">
              {map(
                getTransactionData,
                (
                  {
                    hash,
                    fee,
                    date,
                    value,
                    tokenName,
                    tokenDecimal,
                    tokenSymbol,
                  },
                  i,
                ) => (
                  <tr key={i}>
                    <td>{hash}</td>
                    <td>${getFeeInUsd(fee, price)}</td>
                    <td>{new Date(date).toLocaleString()}</td>
                    <td>
                      $
                      {getValueInUsd(
                        value,
                        tokenDecimal,
                        tokenSymbol,
                        priceInUsd,
                      )}
                    </td>
                    <td className="p-2">{tokenName}</td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
          {isTransactionError && (
            <div className="w-full text-center mt-32">
              <p className="text-4xl">Not Found</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default App;
