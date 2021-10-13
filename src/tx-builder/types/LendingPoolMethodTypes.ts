import { BytesLike } from 'ethers';
import {
  tSmartBCHAddress,
  tStringCurrencyUnits,
  InterestRate,
  PermitSignature,
} from '.';

export type LPDepositParamsType = {
  user: tSmartBCHAddress;
  reserve: tSmartBCHAddress;
  amount: tStringCurrencyUnits;
  onBehalfOf?: tSmartBCHAddress;
  referralCode?: string;
};

export type LPWithdrawParamsType = {
  user: tSmartBCHAddress;
  reserve: tSmartBCHAddress;
  amount: tStringCurrencyUnits;
  onBehalfOf?: tSmartBCHAddress;
  aTokenAddress?: tSmartBCHAddress;
};
export type LPBorrowParamsType = {
  user: tSmartBCHAddress;
  reserve: tSmartBCHAddress;
  amount: tStringCurrencyUnits;
  interestRateMode: InterestRate;
  debtTokenAddress?: tSmartBCHAddress;
  onBehalfOf?: tSmartBCHAddress;
  referralCode?: string;
};
export type LPRepayParamsType = {
  user: tSmartBCHAddress;
  reserve: tSmartBCHAddress;
  amount: tStringCurrencyUnits;
  interestRateMode: InterestRate;
  onBehalfOf?: tSmartBCHAddress;
};
export type LPSwapBorrowRateMode = {
  user: tSmartBCHAddress;
  reserve: tSmartBCHAddress;
  interestRateMode: InterestRate;
};
export type LPSetUsageAsCollateral = {
  user: tSmartBCHAddress;
  reserve: tSmartBCHAddress;
  usageAsCollateral: boolean;
};
export type LPLiquidationCall = {
  liquidator: tSmartBCHAddress;
  liquidatedUser: tSmartBCHAddress;
  debtReserve: tSmartBCHAddress;
  collateralReserve: tSmartBCHAddress;
  purchaseAmount: tStringCurrencyUnits;
  getAToken?: boolean;
  liquidateAll?: boolean;
};

export type LPSwapCollateral = {
  user: tSmartBCHAddress;
  flash?: boolean;
  fromAsset: tSmartBCHAddress; // List of addresses of the underlying asset to be swap from
  fromAToken: tSmartBCHAddress;
  toAsset: tSmartBCHAddress; // List of the addresses of the reserve to be swapped to and deposited
  fromAmount: tStringCurrencyUnits; // List of amounts to be swapped. If the amount exceeds the balance, the total balance is used for the swap
  minToAmount: tStringCurrencyUnits;
  permitSignature?: PermitSignature;
  swapAll: boolean;
  onBehalfOf?: tSmartBCHAddress;
  referralCode?: string;
  augustus: tSmartBCHAddress;
  swapCallData: BytesLike;
};

export type LPRepayWithCollateral = {
  user: tSmartBCHAddress;
  fromAsset: tSmartBCHAddress;
  fromAToken: tSmartBCHAddress;
  assetToRepay: tSmartBCHAddress; // List of addresses of the underlying asset to be swap from
  repayWithAmount: tStringCurrencyUnits;
  repayAmount: tStringCurrencyUnits; // List of amounts to be swapped. If the amount exceeds the balance, the total balance is used for the swap
  permitSignature?: PermitSignature;
  repayAllDebt?: boolean;
  rateMode: InterestRate;
  onBehalfOf?: tSmartBCHAddress;
  referralCode?: string;
  flash?: boolean;
  useBchPath?: boolean;
};

export type LPFlashLoan = {
  user: tSmartBCHAddress;
  receiver: tSmartBCHAddress;
  assets: tSmartBCHAddress[];
  amounts: tStringCurrencyUnits[];
  modes: InterestRate[];
  onBehalfOf?: tSmartBCHAddress;
  referralCode?: string;
};

export type LPFlashLiquidation = {
  user: tSmartBCHAddress;
  collateralAsset: tSmartBCHAddress;
  borrowedAsset: tSmartBCHAddress;
  debtTokenCover: string;
  liquidateAll: boolean;
  initiator: tSmartBCHAddress;
  useBchPath: boolean;
};
