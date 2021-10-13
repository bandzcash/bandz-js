import {
  SmartBCHTransactionTypeExtended,
  tSmartBCHAddress,
  tStringCurrencyUnits,
} from '../types';

export default interface StakingInterface {
  stakingContractAddress: tSmartBCHAddress;
  stakingRewardTokenContractAddress: tSmartBCHAddress;

  stake: (
    user: tSmartBCHAddress,
    amount: tStringCurrencyUnits,
    onBehalfOf?: tSmartBCHAddress
  ) => Promise<SmartBCHTransactionTypeExtended[]>;
  redeem: (
    user: tSmartBCHAddress,
    amount: tStringCurrencyUnits
  ) => Promise<SmartBCHTransactionTypeExtended[]>;
  cooldown: (
    user: tSmartBCHAddress
  ) => Promise<SmartBCHTransactionTypeExtended[]>;
  claimRewards: (
    user: tSmartBCHAddress,
    amount: tStringCurrencyUnits
  ) => Promise<SmartBCHTransactionTypeExtended[]>;
  signStaking: (
    user: tSmartBCHAddress,
    amount: tStringCurrencyUnits,
    nonce: string
  ) => Promise<string>;
  stakeWithPermit: (
    user: tSmartBCHAddress,
    amount: tStringCurrencyUnits,
    signature: string
  ) => Promise<SmartBCHTransactionTypeExtended[]>;
}
