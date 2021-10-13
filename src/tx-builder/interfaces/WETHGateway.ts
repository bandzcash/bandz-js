import { EthereumTransactionTypeExtended } from '../types';
import {
  WETHBorrowParamsType,
  WETHDepositParamsType,
  WETHRepayParamsType,
  WETHWithdrawParamsType,
} from '../types/WethGatewayMethodTypes';

export default interface WETHGatewayInterface {
  depositBCH: (
    args: WETHDepositParamsType
  ) => Promise<EthereumTransactionTypeExtended[]>;
  withdrawBCH: (
    args: WETHWithdrawParamsType
  ) => Promise<EthereumTransactionTypeExtended[]>;
  repayBCH: (
    args: WETHRepayParamsType
  ) => Promise<EthereumTransactionTypeExtended[]>;
  borrowBCH: (
    args: WETHBorrowParamsType
  ) => Promise<EthereumTransactionTypeExtended[]>;
}
