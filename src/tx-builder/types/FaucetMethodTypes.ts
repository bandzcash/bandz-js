import { tSmartBCHAddress } from '.';

export type FaucetParamsType = {
  userAddress: tSmartBCHAddress;
  reserve: tSmartBCHAddress;
  tokenSymbol: string;
};
