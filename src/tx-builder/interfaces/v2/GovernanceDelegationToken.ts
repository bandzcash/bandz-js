import {
  SmartBCHTransactionTypeExtended,
  tSmartBCHAddress,
  tStringCurrencyUnits,
  tStringDecimalUnits,
} from '../../types';
import {
  GovDelegate,
  GovDelegateBySig,
  GovDelegateByType,
  GovDelegateByTypeBySig,
  GovGetDelegateeByType,
  GovGetNonce,
  GovGetPowerAtBlock,
  GovGetPowerCurrent,
  GovPrepareDelegateSig,
  GovPrepareDelegateSigByType,
} from '../../types/GovDelegationMethodTypes';

export default interface GovernanceDelegationToken {
  delegate: (args: GovDelegate) => Promise<SmartBCHTransactionTypeExtended[]>;
  delegateByType: (
    args: GovDelegateByType
  ) => Promise<SmartBCHTransactionTypeExtended[]>;
  delegateBySig: (
    args: GovDelegateBySig
  ) => Promise<SmartBCHTransactionTypeExtended[]>;
  delegateByTypeBySig: (
    args: GovDelegateByTypeBySig
  ) => Promise<SmartBCHTransactionTypeExtended[]>;
  prepareDelegateSignature: (args: GovPrepareDelegateSig) => Promise<string>;
  prepareDelegateByTypeSignature: (
    args: GovPrepareDelegateSigByType
  ) => Promise<string>;
  getDelegateeByType: (
    args: GovGetDelegateeByType
  ) => Promise<tSmartBCHAddress>;
  getPowerCurrent: (args: GovGetPowerCurrent) => Promise<tStringCurrencyUnits>;
  getPowerAtBlock: (args: GovGetPowerAtBlock) => Promise<tStringCurrencyUnits>;
  getNonce: (args: GovGetNonce) => Promise<tStringDecimalUnits>;
}
