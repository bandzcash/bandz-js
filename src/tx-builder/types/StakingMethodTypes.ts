import { tSmartBCHAddress, tStringCurrencyUnits } from '.';

export type signStakingParamsType = {
  user: tSmartBCHAddress;
  amount: tStringCurrencyUnits;
  nonce: string;
};

export type stakeWithPermitParamsType = {
  user: tSmartBCHAddress;
  amount: tStringCurrencyUnits;
  signature: string;
};

export type stakeParamsType = {
  user: tSmartBCHAddress;
  amount: tStringCurrencyUnits;
  onBehalfOf?: tSmartBCHAddress;
};

export type redeemParamsType = {
  user: tSmartBCHAddress;
  amount: tStringCurrencyUnits;
};

export type cooldownParamsType = {
  user: tSmartBCHAddress;
};

export type claimRewardsParamsType = {
  user: tSmartBCHAddress;
  amount: tStringCurrencyUnits;
};
