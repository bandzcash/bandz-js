import {
  tSmartBCHAddress,
  tStringCurrencyUnits,
  SmartBCHTransactionTypeExtended,
  tStringDecimalUnits,
  TokenMetadataType,
} from '../types';

export default interface IERC20ServiceInterface {
  decimalsOf: (token: tSmartBCHAddress) => Promise<number>;
  getTokenData: (token: tSmartBCHAddress) => Promise<TokenMetadataType>;
  isApproved: (
    token: tSmartBCHAddress,
    userAddress: tSmartBCHAddress,
    spender: tSmartBCHAddress,
    amount: tStringCurrencyUnits
  ) => Promise<boolean>;
  approve: (
    user: tSmartBCHAddress,
    token: tSmartBCHAddress,
    spender: tSmartBCHAddress,
    amount: tStringDecimalUnits
  ) => SmartBCHTransactionTypeExtended;
}
