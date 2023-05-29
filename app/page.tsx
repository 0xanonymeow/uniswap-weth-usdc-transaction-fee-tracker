'use client';

import { useGetEthUsdcPrice } from '@/hooks/query/useGetEthUsdcPrice';
import { useLazyGetTranasaction } from '@/hooks/query/useGetTransaction';
import { useGetUsdcUsdPrice } from '@/hooks/query/useGetUsdcUsdPrice';
import { getFeeInUsd, getValueInUsd } from '@/lib/clientUtils';
import { Magnifier } from '@/public/icons/magnifier';
import { map } from 'lodash';
import moment, { Moment } from 'moment';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import DateTimePicker from 'react-tailwindcss-datetimepicker';

function App() {
  const [params, setParams] = useState<GetTransaction>({
    page: '1',
    take: '50',
  });

  const {
    data: ethPrice,
    // isLoading: isGetEthUsdcPriceLoading
  } = useGetEthUsdcPrice();
  const {
    data: usdcUsd,
    // isLoading: isGetUsdcUsdPriceLoading
  } = useGetUsdcUsdPrice();

  const priceInUsd = useMemo(
    () => ({ WETH: ethPrice, USDC: usdcUsd }),
    [ethPrice, usdcUsd],
  );

  const {
    data,
    refetch,
    error: getTransactionError,
  } = useLazyGetTranasaction(params);

  console.log(params);
  const lastPage = useMemo(() => data?.lastPage || 1, [data]);

  useEffect(() => {
    if (getTransactionError) toast.error(getTransactionError);
  }, [getTransactionError]);

  const now = new Date();
  const start = moment(
    new Date(
      Date.UTC(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
        0,
      ),
    ),
  ).utc();
  const end = moment(start).add(1, 'days').subtract(1, 'seconds');
  const [range, setRange] = useState({
    start,
    end,
  });
  const ranges = {
    Today: [moment(start), moment(end)],
  };
  const local = {
    format: 'DD-MM-YYYY HH:mm',
    sundayFirst: false,
  };
  function handleApply(startDate: Moment, endDate: Moment) {
    setRange({ start: startDate, end: endDate });
  }

  const onSearch = () => {
    const startDate = new Date(range.start.format()).toISOString();
    const endDate = new Date(range.end.format()).toISOString();
    refetch();
  };

  const onSetPage = (e: { target: { value: string } }) => {
    setParams({ ...params, page: e.target.value });
  };

  const onSetItemsPerPage = (e: { target: { value: string } }) => {
    setParams({ ...params, take: e.target.value });
  };

  useEffect(() => {
    refetch()
  }, [params, refetch])

  return (
    <main className="min-w-screen min-h-screen">
      <div className="flex flex-col justify-center p-32">
        <div className="">
          <div className="flx flex w-full justify-center gap-2 align-middle">
            <input
              className="h-8 w-1/2 rounded-md px-4 dark:text-black"
              value={params.id}
              onChange={(e) =>
                setParams({ ...params, id: e.target.value })
              }
              placeholder="0x3d4f354..."
            />
            <button
              type="button"
              onClick={onSearch}
              className="h-8 w-8"
            >
              <Magnifier />
            </button>
          </div>
          <div className="flex justify-center mt-28">
            {/* @ts-ignore */}
            <DateTimePicker
              ranges={ranges}
              start={range.start}
              end={range.end}
              local={local}
              applyCallback={handleApply}
              smartMode
            >
              <input
                className="w-[400px] rounded-md py-4  text-center bg-slate-400 text-white"
                placeholder="Date range"
                value={`${range.start.format(
                  'DD-MM-YYYY HH:mm',
                )} - ${range.end.format('DD-MM-YYYY HH:mm')}`}
                // value={`${range.start} - ${range.end}`}
                disabled
              />
            </DateTimePicker>
          </div>
        </div>
        <div className="mt-16 flex w-full flex-col justify-center align-middle">
          <div className="flex w-full justify-end">
            <div className="mb-4 flex w-auto gap-2">
              <label htmlFor="page" className="self-center">
                Page
              </label>
              <select
                id="page"
                className="min-w-[50px] text-center"
                onChange={onSetPage}
              >
                {map([...Array(lastPage)], (_, i) => (
                  <option key={i}>{i + 1}</option>
                ))}
              </select>
              <label htmlFor="items-per-page" className="self-center">
                Items per page
              </label>
              <select
                id="items-per-page"
                className="min-w-[50px] text-center"
                onChange={onSetItemsPerPage}
              >
                <option>50</option>
                <option>100</option>
                <option>150</option>
                <option>200</option>
                <option>250</option>
                <option>300</option>
              </select>
            </div>
          </div>
          <table className="w-full text-white dark:text-slate-800">
            <thead
              className="bg-slate-600 text-center dark:bg-slate-400"
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
            <tbody className="bg-slate-500 text-end dark:bg-slate-100">
              {map(
                data?.data,
                (
                  {
                    hash,
                    fee,
                    date,
                    value,
                    tokenName,
                    tokenDecimal,
                    tokenSymbol,
                  }: TransformedTransaction,
                  i: number,
                ) => (
                  <tr key={i}>
                    <td>{hash}</td>
                    <td>${getFeeInUsd(fee, ethPrice)}</td>
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
          {getTransactionError && (
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
