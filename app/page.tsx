'use client';

import { useGetEthUsdcPrice } from '@/hooks/query/useGetEthUsdcPrice';
import { useLazyGetTranasaction } from '@/hooks/query/useGetTransaction';
import { useGetUsdcUsdPrice } from '@/hooks/query/useGetUsdcUsdPrice';
import { getFeeInUsd, getValueInUsd } from '@/lib/utils';
import { Magnifier } from '@/public/icons/magnifier';
import { map } from 'lodash';
import { useMemo, useState } from 'react';

function App() {
  const [params, setParams] = useState<GetTransaction>({
    id: '',
    page: '1',
    offset: '50',
  });

  const {
    data,
    // isLoading: isGetTransactionLoading,
    refetch,
  } = useLazyGetTranasaction(params);
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
    refetch();
  };

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
        <div className="w-full mt-16 flex justify-center">
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
                data,
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
                  <tr key={i} className="">
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
        </div>
      </div>
    </main>
  );
}

export default App;
