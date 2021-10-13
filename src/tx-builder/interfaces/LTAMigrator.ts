import {
  tSmartBCHAddress,
  SmartBCHTransactionTypeExtended,
  tStringCurrencyUnits,
} from '../types';

export default interface LTAMigratorInterface {
  migrateLendToAave: (
    user: tSmartBCHAddress,
    amount: tStringCurrencyUnits
  ) => Promise<SmartBCHTransactionTypeExtended[]>;
}
