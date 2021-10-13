import { PermitSignature, tSmartBCHAddress } from '.';

export type RepayWithCollateralType = {
  user: tSmartBCHAddress;
  collateralAsset: tSmartBCHAddress;
  debtAsset: tSmartBCHAddress;
  collateralAmount: string;
  debtRepayAmount: string;
  debtRateMode: number;
  permit: PermitSignature;
  useBchPath?: boolean;
};
