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
  const [showDatetimePicker, setShowDatetimePicker] = useState(false);

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

  const { data, refetch } = useLazyGetTranasaction(params);
  const getTransactionError = useMemo(() => data?.message, [data]);

  const lastPage = useMemo(() => data?.lastPage || 1, [data]);
  const totalETH = useMemo(() => data?.totalETH || 0, [data]);
  const totalUSDC = useMemo(() => data?.totalUSDC || 0, [data]);

  const now = new Date();
  const start = moment(
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
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

  const handleApply = (startDate: Moment, endDate: Moment) => {
    setRange({ start: startDate, end: endDate });
  };

  const onSearch = () => refetch();

  const onSetPage = (e: { target: { value: string } }) => {
    setParams({ ...params, page: e.target.value });
  };

  const onSetItemsPerPage = (e: { target: { value: string } }) => {
    setParams({ ...params, take: e.target.value });
  };

  useEffect(() => {
    refetch();
  }, [params?.page, params?.take, refetch]);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (!showDatetimePicker) {
      delete params.startDate;
      delete params.endDate;
      return setParams({ ...params });
    }
    const startDate = range.start.utc().format();
    const endDate = range.end.utc().format();

    setParams({ ...params, startDate, endDate });
  }, [range.start, range.end, showDatetimePicker]);

  useEffect(() => {
    if (data?.message) toast.error(data?.message);
  }, [data]);

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
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSearch();
              }}
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
          <div className="mt-28 flex justify-center">
            <div className="mr-8 flex items-center">
              <button
                type="button"
                className="rounded-md bg-blue-300 px-6 py-4"
                onClick={() =>
                  setShowDatetimePicker(!showDatetimePicker)
                }
              >
                <p className="text-white">
                  {`${
                    showDatetimePicker ? 'Remove' : 'Add'
                  } date filter`}
                </p>
              </button>
            </div>
            {showDatetimePicker && (
              // @ts-ignore
              <DateTimePicker
                ranges={ranges}
                start={range.start}
                end={range.end}
                local={local}
                applyCallback={handleApply}
                smartMode
              >
                <input
                  className="w-[400px] rounded-md bg-slate-400  py-4 text-center text-white"
                  placeholder="Date range"
                  value={`${range.start.format(
                    'DD-MM-YYYY HH:mm',
                  )} - ${range.end.format('DD-MM-YYYY HH:mm')}`}
                  disabled
                />
              </DateTimePicker>
            )}
          </div>
        </div>
        <div className="mt-16 flex w-full flex-col justify-center align-middle">
          <div className="mb-4  flex">
            <div className="flex w-1/2 flex-col ">
              <div>
                <span>Current ETH/USDC Price:</span>
                <span className="ml-2 font-bold">
                  {`$${Number(ethPrice).toFixed(2)}`}
                </span>
              </div>
              <div>
                <span className="mr-2">Total fee in ETH:</span>
                <span className="font-bold">{`$${getValueInUsd(
                  String(totalETH),
                  '18',
                  'WETH',
                  priceInUsd,
                )}`}</span>
              </div>
              <div>
                <span className="mr-2">Total fee in USDC:</span>
                <span className="font-bold">{`$${getValueInUsd(
                  String(totalUSDC),
                  '6',
                  'USDC',
                  priceInUsd,
                )}`}</span>
              </div>
            </div>
            <div className="flex w-1/2 justify-end">
              <div className="mb-4 flex w-auto gap-2">
                <p className="self-center">Page</p>
                <select
                  id="page"
                  className="min-w-[30px] text-center dark:text-black"
                  onChange={onSetPage}
                >
                  {map([...Array(lastPage)], (_, i) => (
                    <option key={i}>{i + 1}</option>
                  ))}
                </select>
                <p className="self-center">Items per page</p>
                <select
                  id="items-per-page"
                  className="min-w-[30px] text-center dark:text-black"
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
              ).slice(0, Number(params.take))}
            </tbody>
          </table>
          {getTransactionError && (
            <div className="mt-32 w-full text-center">
              <p className="text-4xl">Not Found</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default App;
