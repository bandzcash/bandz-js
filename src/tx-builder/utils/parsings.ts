import BigNumber from 'bignumber.js';
import {
  API_BCH_MOCK_ADDRESS,
  DEFAULT_NULL_VALUE_ON_TX,
  uniswapBchAmount,
} from '../config';
import { tStringDecimalUnits } from '../types';

export const parseNumber = (value: string, decimals: number): string => {
  return new BigNumber(value)
    .multipliedBy(new BigNumber(10).pow(decimals))
    .toFixed(0);
};

export const decimalsToCurrencyUnits = (
  value: string,
  decimals: number
): string =>
  new BigNumber(value).div(new BigNumber(10).pow(decimals)).toFixed();

export const getTxValue = (reserve: string, amount: string): string => {
  return reserve.toLowerCase() === API_BCH_MOCK_ADDRESS.toLowerCase()
    ? amount
    : DEFAULT_NULL_VALUE_ON_TX;
};

export const mintAmountsPerToken: { [token: string]: tStringDecimalUnits } = {
  BANDZ: parseNumber('100', 18),
  BAT: parseNumber('100000', 18),
  BUSD: parseNumber('10000', 18),
  DAI: parseNumber('10000', 18),
  ENJ: parseNumber('100000', 18),
  KNC: parseNumber('10000', 18),
  LEND: parseNumber('1000', 18), // Not available on v2, but to support v1 faucet
  LINK: parseNumber('1000', 18),
  MANA: parseNumber('100000', 18),
  MKR: parseNumber('10', 18),
  WBCH: parseNumber('10', 18),
  REN: parseNumber('10000', 18),
  REP: parseNumber('1000', 18),
  SNX: parseNumber('100', 18),
  SUSD: parseNumber('10000', 18),
  TUSD: '0', // The TusdMinter contract already mints the maximum
  UNI: parseNumber('1000', 18),
  USDC: parseNumber('10000', 6),
  USDT: parseNumber('10000', 6),
  WBTC: parseNumber('1', 8),
  YFI: parseNumber('1', 18),
  ZRX: parseNumber('100000', 18),
  UNIUSDC: parseNumber(uniswapBchAmount, 6),
  UNIDAI: parseNumber(uniswapBchAmount, 18),
  UNIUSDT: parseNumber(uniswapBchAmount, 6),
  UNIDAIETH: parseNumber(uniswapBchAmount, 18),
  UNIUSDCETH: parseNumber(uniswapBchAmount, 18),
  UNISETHETH: parseNumber(uniswapBchAmount, 18),
  UNILENDETH: parseNumber(uniswapBchAmount, 18),
  UNILINKETH: parseNumber(uniswapBchAmount, 18),
  UNIMKRETH: parseNumber(uniswapBchAmount, 18),
};

export const canBeEnsAddress = (ensAddress: string): boolean => {
  return ensAddress.toLowerCase().endsWith('.eth');
};
