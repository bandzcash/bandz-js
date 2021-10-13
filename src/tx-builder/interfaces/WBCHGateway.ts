import { SmartBCHTransactionTypeExtended } from '../types';
import {
  WBCHBorrowParamsType,
  WBCHDepositParamsType,
  WBCHRepayParamsType,
  WBCHWithdrawParamsType,
} from '../types/WbchGatewayMethodTypes';

export default interface WBCHGatewayInterface {
  depositBCH: (
    args: WBCHDepositParamsType
  ) => Promise<SmartBCHTransactionTypeExtended[]>;
  withdrawBCH: (
    args: WBCHWithdrawParamsType
  ) => Promise<SmartBCHTransactionTypeExtended[]>;
  repayBCH: (
    args: WBCHRepayParamsType
  ) => Promise<SmartBCHTransactionTypeExtended[]>;
  borrowBCH: (
    args: WBCHBorrowParamsType
  ) => Promise<SmartBCHTransactionTypeExtended[]>;
}
