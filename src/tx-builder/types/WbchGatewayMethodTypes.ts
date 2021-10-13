import { InterestRate, tSmartBCHAddress, tStringCurrencyUnits } from '.';

export type WBCHDepositParamsType = {
  lendingPool: tSmartBCHAddress;
  user: tSmartBCHAddress;
  amount: tStringCurrencyUnits;
  onBehalfOf?: tSmartBCHAddress;
  referralCode?: string;
};

export type WBCHWithdrawParamsType = {
  lendingPool: tSmartBCHAddress;
  user: tSmartBCHAddress;
  amount: tStringCurrencyUnits;
  aTokenAddress: tSmartBCHAddress;
  onBehalfOf?: tSmartBCHAddress;
};

export type WBCHRepayParamsType = {
  lendingPool: tSmartBCHAddress;
  user: tSmartBCHAddress;
  amount: tStringCurrencyUnits;
  interestRateMode: InterestRate;
  onBehalfOf?: tSmartBCHAddress;
};

export type WBCHBorrowParamsType = {
  lendingPool: tSmartBCHAddress;
  user: tSmartBCHAddress;
  amount: tStringCurrencyUnits;
  debtTokenAddress: tSmartBCHAddress;
  interestRateMode: InterestRate;
  referralCode?: string;
};
