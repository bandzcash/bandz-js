import { constants } from 'ethers';
import { IWBCHGateway, IWBCHGateway__factory } from '../contract-types';
import BaseDebtTokenInterface from '../interfaces/BaseDebtToken';
import IERC20ServiceInterface from '../interfaces/ERC20';
import WETHGatewayInterface from '../interfaces/WETHGateway';
import {
  Configuration,
  eEthereumTxType,
  EthereumTransactionTypeExtended,
  InterestRate,
  LendingPoolMarketConfig,
  ProtocolAction,
  transactionType,
  tStringDecimalUnits,
} from '../types';
import {
  WETHBorrowParamsType,
  WETHDepositParamsType,
  WETHRepayParamsType,
  WETHWithdrawParamsType,
} from '../types/WethGatewayMethodTypes';
import { parseNumber } from '../utils/parsings';
import { WETHValidator } from '../validators/methodValidators';
import {
  IsEthAddress,
  IsPositiveAmount,
  IsPositiveOrMinusOneAmount,
} from '../validators/paramValidators';
import BaseService from './BaseService';

export default class WETHGatewayService
  extends BaseService<IWBCHGateway>
  implements WETHGatewayInterface {
  readonly wethGatewayAddress: string;

  readonly config: Configuration;

  readonly baseDebtTokenService: BaseDebtTokenInterface;

  readonly erc20Service: IERC20ServiceInterface;

  readonly wethGatewayConfig: LendingPoolMarketConfig | undefined;

  constructor(
    config: Configuration,
    baseDebtTokenService: BaseDebtTokenInterface,
    erc20Service: IERC20ServiceInterface,
    wethGatewayConfig: LendingPoolMarketConfig | undefined
  ) {
    super(config, IWBCHGateway__factory);
    this.wethGatewayConfig = wethGatewayConfig;
    this.baseDebtTokenService = baseDebtTokenService;
    this.erc20Service = erc20Service;

    this.wethGatewayAddress = this.wethGatewayConfig?.WBCH_GATEWAY || '';
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
    }: WETHDepositParamsType
  ): Promise<EthereumTransactionTypeExtended[]> {
    const convertedAmount: tStringDecimalUnits = parseNumber(amount, 18);

    const wethGatewayContract: IWBCHGateway = this.getContractInstance(
      this.wethGatewayAddress
    );
    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        wethGatewayContract.populateTransaction.depositBCH(
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
        txType: eEthereumTxType.DLP_ACTION,
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
    }: WETHBorrowParamsType
  ): Promise<EthereumTransactionTypeExtended[]> {
    const txs: EthereumTransactionTypeExtended[] = [];
    const convertedAmount: tStringDecimalUnits = parseNumber(amount, 18);
    const numericRateMode = interestRateMode === InterestRate.Variable ? 2 : 1;

    const delegationApproved: boolean = await this.baseDebtTokenService.isDelegationApproved(
      debtTokenAddress,
      user,
      this.wethGatewayAddress,
      amount
    );

    if (!delegationApproved) {
      const approveDelegationTx: EthereumTransactionTypeExtended = this.baseDebtTokenService.approveDelegation(
        user,
        this.wethGatewayAddress,
        debtTokenAddress,
        constants.MaxUint256.toString()
      );

      txs.push(approveDelegationTx);
    }
    const wethGatewayContract: IWBCHGateway = this.getContractInstance(
      this.wethGatewayAddress
    );

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        wethGatewayContract.populateTransaction.borrowBCH(
          lendingPool,
          convertedAmount,
          numericRateMode,
          referralCode || '0'
        ),
      from: user,
    });

    txs.push({
      tx: txCallback,
      txType: eEthereumTxType.DLP_ACTION,
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
    }: WETHWithdrawParamsType
  ): Promise<EthereumTransactionTypeExtended[]> {
    const txs: EthereumTransactionTypeExtended[] = [];
    const { isApproved, approve }: IERC20ServiceInterface = this.erc20Service;
    const convertedAmount: tStringDecimalUnits =
      amount === '-1'
        ? constants.MaxUint256.toString()
        : parseNumber(amount, 18);

    const approved: boolean = await isApproved(
      aTokenAddress,
      user,
      this.wethGatewayAddress,
      amount
    );

    if (!approved) {
      const approveTx: EthereumTransactionTypeExtended = approve(
        user,
        aTokenAddress,
        this.wethGatewayAddress,
        constants.MaxUint256.toString()
      );
      txs.push(approveTx);
    }
    const wethGatewayContract: IWBCHGateway = this.getContractInstance(
      this.wethGatewayAddress
    );

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        wethGatewayContract.populateTransaction.withdrawBCH(
          lendingPool,
          convertedAmount,
          onBehalfOf || user
        ),
      from: user,
    });

    txs.push({
      tx: txCallback,
      txType: eEthereumTxType.DLP_ACTION,
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
    }: WETHRepayParamsType
  ): Promise<EthereumTransactionTypeExtended[]> {
    const convertedAmount: tStringDecimalUnits = parseNumber(amount, 18);
    const numericRateMode = interestRateMode === InterestRate.Variable ? 2 : 1;
    const wethGatewayContract: IWBCHGateway = this.getContractInstance(
      this.wethGatewayAddress
    );

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        wethGatewayContract.populateTransaction.repayBCH(
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
        txType: eEthereumTxType.DLP_ACTION,
        gas: this.generateTxPriceEstimation([], txCallback),
      },
    ];
  }
}
