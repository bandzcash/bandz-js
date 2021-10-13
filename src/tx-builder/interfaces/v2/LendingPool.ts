import { SmartBCHTransactionTypeExtended } from '../../types';
import {
  LPBorrowParamsType,
  LPDepositParamsType,
  LPLiquidationCall,
  LPRepayParamsType,
  LPRepayWithCollateral,
  LPSetUsageAsCollateral,
  LPSwapBorrowRateMode,
  LPSwapCollateral,
  LPWithdrawParamsType,
  LPFlashLiquidation,
} from '../../types/LendingPoolMethodTypes';

export default interface LendingPoolInterface {
  deposit: (
    args: LPDepositParamsType
  ) => Promise<SmartBCHTransactionTypeExtended[]>;
  withdraw: (
    args: LPWithdrawParamsType
  ) => Promise<SmartBCHTransactionTypeExtended[]>;
  // delegateBorrowAllowance: (
  //   user: tSmartBCHAddress,
  //   asset: tSmartBCHAddress,
  //   interestRateMode: InterestRate,
  //   amount: tStringCurrencyUnits,
  // ) => Promise<SmartBCHTransactionTypeExtended[]>;
  borrow: (
    args: LPBorrowParamsType
  ) => Promise<SmartBCHTransactionTypeExtended[]>;
  repay: (
    args: LPRepayParamsType
  ) => Promise<SmartBCHTransactionTypeExtended[]>;
  swapBorrowRateMode: (
    args: LPSwapBorrowRateMode
  ) => Promise<SmartBCHTransactionTypeExtended[]>;
  // rebalanceStableBorrowRate: (
  //   user: tSmartBCHAddress,
  //   reserve: tSmartBCHAddress,
  // ) => Promise<SmartBCHTransactionTypeExtended[]>;
  setUsageAsCollateral: (
    args: LPSetUsageAsCollateral
  ) => Promise<SmartBCHTransactionTypeExtended[]>;
  liquidationCall: (
    args: LPLiquidationCall
  ) => Promise<SmartBCHTransactionTypeExtended[]>;
  swapCollateral: (
    args: LPSwapCollateral
  ) => Promise<SmartBCHTransactionTypeExtended[]>;
  repayWithCollateral: (
    args: LPRepayWithCollateral
  ) => Promise<SmartBCHTransactionTypeExtended[]>;
  flashLiquidation(
    args: LPFlashLiquidation
  ): Promise<SmartBCHTransactionTypeExtended[]>;
}
