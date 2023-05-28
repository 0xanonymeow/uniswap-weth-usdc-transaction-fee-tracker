export const ETHERSCAN_BASE_URL =
  process.env.ETHERSCAN_BASE_URL ||
  process.env.VITE_ETHERSCAN_BASE_URL;
export const ETHERSCAN_API_KEY =
  process.env.ETHERSCAN_API_KEY || process.env.VITE_ETHERSCAN_API_KEY; // if apiKey is undefined, rate limit of 1 request per 5 seconds will be applied
export const UNISWAP_WETH_USDC_PAIR_CONTRACT_ADDRESS =
  '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640';
