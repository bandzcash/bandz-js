import { BytesLike } from 'ethers';
import { PermitSignature, tSmartBCHAddress } from '.';

export type SwapAndDepositMethodType = {
  user: tSmartBCHAddress;
  assetToSwapFrom: tSmartBCHAddress;
  assetToSwapTo: tSmartBCHAddress;
  amountToSwap: string;
  minAmountToReceive: string;
  permitParams: PermitSignature;
  swapCallData: BytesLike;
  augustus: tSmartBCHAddress;
  swapAll: boolean;
};
