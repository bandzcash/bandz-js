import {
  SmartBCHTransactionTypeExtended,
  tSmartBCHAddress,
  tStringCurrencyUnits,
  tStringDecimalUnits,
} from '../types';

export default interface BaseDebtTokenInterface {
  approveDelegation: (
    user: tSmartBCHAddress,
    delegatee: tSmartBCHAddress,
    debtTokenAddress: tSmartBCHAddress,
    amount: tStringDecimalUnits
  ) => SmartBCHTransactionTypeExtended;
  isDelegationApproved: (
    debtTokenAddress: tSmartBCHAddress,
    allowanceGiver: tSmartBCHAddress,
    spender: tSmartBCHAddress,
    amount: tStringCurrencyUnits
  ) => Promise<boolean>;
}
