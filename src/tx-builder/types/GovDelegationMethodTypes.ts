import { ENS, tSmartBCHAddress, tStringDecimalUnits } from '.';

export type GovDelegate = {
  user: tSmartBCHAddress;
  delegatee: tSmartBCHAddress | ENS;
  governanceToken: tSmartBCHAddress;
};

export type GovDelegateByType = {
  user: tSmartBCHAddress;
  delegatee: tSmartBCHAddress | ENS;
  delegationType: tStringDecimalUnits;
  governanceToken: tSmartBCHAddress;
};
export type GovDelegateBySig = {
  user: tSmartBCHAddress;
  delegatee: tSmartBCHAddress | ENS;
  expiry: tStringDecimalUnits;
  signature: string;
  governanceToken: tSmartBCHAddress;
};
export type GovDelegateByTypeBySig = {
  user: tSmartBCHAddress;
  delegatee: tSmartBCHAddress | ENS;
  delegationType: tStringDecimalUnits;
  expiry: tStringDecimalUnits;
  signature: string;
  governanceToken: tSmartBCHAddress;
};
export type GovPrepareDelegateSig = {
  delegatee: tSmartBCHAddress | ENS;
  nonce: tStringDecimalUnits;
  expiry: tStringDecimalUnits;
  governanceTokenName: string;
  governanceToken: tSmartBCHAddress;
};
export type GovPrepareDelegateSigByType = {
  delegatee: tSmartBCHAddress | ENS;
  type: tStringDecimalUnits;
  nonce: tStringDecimalUnits;
  expiry: tStringDecimalUnits;
  governanceTokenName: string;
  governanceToken: tSmartBCHAddress;
};

// Data types
export type GovGetDelegateeByType = {
  delegator: tSmartBCHAddress;
  delegationType: tStringDecimalUnits;
  governanceToken: tSmartBCHAddress;
};
export type GovGetPowerCurrent = {
  user: tSmartBCHAddress;
  delegationType: tStringDecimalUnits;
  governanceToken: tSmartBCHAddress;
};
export type GovGetPowerAtBlock = {
  user: tSmartBCHAddress;
  blockNumber: tStringDecimalUnits;
  delegationType: tStringDecimalUnits;
  governanceToken: tSmartBCHAddress;
};
export type GovGetNonce = {
  user: tSmartBCHAddress;
  governanceToken: tSmartBCHAddress;
};
