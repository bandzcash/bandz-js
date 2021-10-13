import { constants } from 'ethers';
import { IWBCHGateway, IWBCHGateway__factory } from '../contract-types';
import BaseDebtTokenInterface from '../interfaces/BaseDebtToken';
import IERC20ServiceInterface from '../interfaces/ERC20';
import WBCHGatewayInterface from '../interfaces/WBCHGateway';
import {
  Configuration,
  eSmartBCHTxType,
  SmartBCHTransactionTypeExtended,
  InterestRate,
  LendingPoolMarketConfig,
  ProtocolAction,
  transactionType,
  tStringDecimalUnits,
} from '../types';
import {
  WBCHBorrowParamsType,
  WBCHDepositParamsType,
  WBCHRepayParamsType,
  WBCHWithdrawParamsType,
} from '../types/WbchGatewayMethodTypes';
import { parseNumber } from '../utils/parsings';
import { WETHValidator } from '../validators/methodValidators';
import {
  IsEthAddress,
  IsPositiveAmount,
  IsPositiveOrMinusOneAmount,
} from '../validators/paramValidators';
import BaseService from './BaseService';

export default class WBCHGatewayService
  extends BaseService<IWBCHGateway>
  implements WBCHGatewayInterface {
  readonly WBCHGatewayAddress: string;

  readonly config: Configuration;

  readonly baseDebtTokenService: BaseDebtTokenInterface;

  readonly erc20Service: IERC20ServiceInterface;

  readonly WBCHGatewayConfig: LendingPoolMarketConfig | undefined;

  constructor(
    config: Configuration,
    baseDebtTokenService: BaseDebtTokenInterface,
    erc20Service: IERC20ServiceInterface,
    WBCHGatewayConfig: LendingPoolMarketConfig | undefined
  ) {
    super(config, IWBCHGateway__factory);
    this.WBCHGatewayConfig = WBCHGatewayConfig;
    this.baseDebtTokenService = baseDebtTokenService;
    this.erc20Service = erc20Service;

    this.WBCHGatewayAddress = this.WBCHGatewayConfig?.WBCH_GATEWAY || '';
  }

  @WETHValidator
  public async depositBCH(
    @IsEthAddress('lendingPool')
    @IsEthAddress('user')
    @IsEthAddress('onBehalfOf')
    @IsPositiveAmount('amount')
    {
      lendingPool,
      user,
      amount,
      onBehalfOf,
      referralCode,
    }: WBCHDepositParamsType
  ): Promise<SmartBCHTransactionTypeExtended[]> {
    const convertedAmount: tStringDecimalUnits = parseNumber(amount, 18);

    const WBCHGatewayContract: IWBCHGateway = this.getContractInstance(
      this.WBCHGatewayAddress
    );
    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        WBCHGatewayContract.populateTransaction.depositBCH(
          lendingPool,
          onBehalfOf || user,
          referralCode || '0'
        ),
      from: user,
      value: convertedAmount,
    });

    return [
      {
        tx: txCallback,
        txType: eSmartBCHTxType.DLP_ACTION,
        gas: this.generateTxPriceEstimation([], txCallback),
      },
    ];
  }

  @WETHValidator
  public async borrowBCH(
    @IsEthAddress('lendingPool')
    @IsEthAddress('user')
    @IsPositiveAmount('amount')
    @IsEthAddress('debtTokenAddress')
    {
      lendingPool,
      user,
      amount,
      debtTokenAddress,
      interestRateMode,
      referralCode,
    }: WBCHBorrowParamsType
  ): Promise<SmartBCHTransactionTypeExtended[]> {
    const txs: SmartBCHTransactionTypeExtended[] = [];
    const convertedAmount: tStringDecimalUnits = parseNumber(amount, 18);
    const numericRateMode = interestRateMode === InterestRate.Variable ? 2 : 1;

    const delegationApproved: boolean = await this.baseDebtTokenService.isDelegationApproved(
      debtTokenAddress,
      user,
      this.WBCHGatewayAddress,
      amount
    );

    if (!delegationApproved) {
      const approveDelegationTx: SmartBCHTransactionTypeExtended = this.baseDebtTokenService.approveDelegation(
        user,
        this.WBCHGatewayAddress,
        debtTokenAddress,
        constants.MaxUint256.toString()
      );

      txs.push(approveDelegationTx);
    }
    const WBCHGatewayContract: IWBCHGateway = this.getContractInstance(
      this.WBCHGatewayAddress
    );

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        WBCHGatewayContract.populateTransaction.borrowBCH(
          lendingPool,
          convertedAmount,
          numericRateMode,
          referralCode || '0'
        ),
      from: user,
    });

    txs.push({
      tx: txCallback,
      txType: eSmartBCHTxType.DLP_ACTION,
      gas: this.generateTxPriceEstimation(
        txs,
        txCallback,
        ProtocolAction.borrowBCH
      ),
    });

    return txs;
  }

  @WETHValidator
  public async withdrawBCH(
    @IsEthAddress('lendingPool')
    @IsEthAddress('user')
    @IsEthAddress('onBehalfOf')
    @IsPositiveOrMinusOneAmount('amount')
    @IsEthAddress('aTokenAddress')
    {
      lendingPool,
      user,
      amount,
      onBehalfOf,
      aTokenAddress,
    }: WBCHWithdrawParamsType
  ): Promise<SmartBCHTransactionTypeExtended[]> {
    const txs: SmartBCHTransactionTypeExtended[] = [];
    const { isApproved, approve }: IERC20ServiceInterface = this.erc20Service;
    const convertedAmount: tStringDecimalUnits =
      amount === '-1'
        ? constants.MaxUint256.toString()
        : parseNumber(amount, 18);

    const approved: boolean = await isApproved(
      aTokenAddress,
      user,
      this.WBCHGatewayAddress,
      amount
    );

    if (!approved) {
      const approveTx: SmartBCHTransactionTypeExtended = approve(
        user,
        aTokenAddress,
        this.WBCHGatewayAddress,
        constants.MaxUint256.toString()
      );
      txs.push(approveTx);
    }
    const WBCHGatewayContract: IWBCHGateway = this.getContractInstance(
      this.WBCHGatewayAddress
    );

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        WBCHGatewayContract.populateTransaction.withdrawBCH(
          lendingPool,
          convertedAmount,
          onBehalfOf || user
        ),
      from: user,
    });

    txs.push({
      tx: txCallback,
      txType: eSmartBCHTxType.DLP_ACTION,
      gas: this.generateTxPriceEstimation(
        txs,
        txCallback,
        ProtocolAction.withdrawBCH
      ),
    });

    return txs;
  }

  @WETHValidator
  public async repayBCH(
    @IsEthAddress('lendingPool')
    @IsEthAddress('user')
    @IsEthAddress('onBehalfOf')
    @IsPositiveAmount('amount')
    {
      lendingPool,
      user,
      amount,
      interestRateMode,
      onBehalfOf,
    }: WBCHRepayParamsType
  ): Promise<SmartBCHTransactionTypeExtended[]> {
    const convertedAmount: tStringDecimalUnits = parseNumber(amount, 18);
    const numericRateMode = interestRateMode === InterestRate.Variable ? 2 : 1;
    const WBCHGatewayContract: IWBCHGateway = this.getContractInstance(
      this.WBCHGatewayAddress
    );

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        WBCHGatewayContract.populateTransaction.repayBCH(
          lendingPool,
          convertedAmount,
          numericRateMode,
          onBehalfOf || user
        ),
      gasSurplus: 30,
      from: user,
      value: convertedAmount,
    });

    return [
      {
        tx: txCallback,
        txType: eSmartBCHTxType.DLP_ACTION,
        gas: this.generateTxPriceEstimation([], txCallback),
      },
    ];
  }
}
