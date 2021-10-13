import {
  IRepayWithCollateral,
  IRepayWithCollateral__factory,
} from '../contract-types';
import RepayWithCollateralAdapterInterface from '../interfaces/RepayWithCollateralAdapter';
import {
  Configuration,
  eSmartBCHTxType,
  SmartBCHTransactionTypeExtended,
  LendingPoolMarketConfig,
  ProtocolAction,
  transactionType,
} from '../types';
import { RepayWithCollateralType } from '../types/RepayWithCollateralMethodTypes';
import { RepayWithCollateralValidator } from '../validators/methodValidators';
import { IsBchAddress, IsPositiveAmount } from '../validators/paramValidators';
import BaseService from './BaseService';

export default class RepayWithCollateralAdapterService
  extends BaseService<IRepayWithCollateral>
  implements RepayWithCollateralAdapterInterface {
  readonly repayWithCollateralAddress: string;

  readonly repayWithCollateralConfig: LendingPoolMarketConfig | undefined;

  constructor(
    config: Configuration,
    repayWithCollateralConfig: LendingPoolMarketConfig | undefined
  ) {
    super(config, IRepayWithCollateral__factory);
    this.repayWithCollateralConfig = repayWithCollateralConfig;

    this.repayWithCollateralAddress =
      this.repayWithCollateralConfig?.REPAY_WITH_COLLATERAL_ADAPTER || '';
  }

  @RepayWithCollateralValidator
  public swapAndRepay(
    @IsBchAddress('user')
    @IsBchAddress('collateralAsset')
    @IsBchAddress('debtAsset')
    @IsPositiveAmount('collateralAmount')
    @IsPositiveAmount('debtRepayAmount')
    {
      user,
      collateralAsset,
      debtAsset,
      collateralAmount,
      debtRepayAmount,
      debtRateMode,
      permit,
      useBchPath,
    }: RepayWithCollateralType,
    txs?: SmartBCHTransactionTypeExtended[]
  ): SmartBCHTransactionTypeExtended {
    const repayWithCollateralContract: IRepayWithCollateral = this.getContractInstance(
      this.repayWithCollateralAddress
    );

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        repayWithCollateralContract.populateTransaction.swapAndRepay(
          collateralAsset,
          debtAsset,
          collateralAmount,
          debtRepayAmount,
          debtRateMode,
          permit,
          useBchPath || false
        ),
      from: user,
    });

    return {
      tx: txCallback,
      txType: eSmartBCHTxType.DLP_ACTION,
      gas: this.generateTxPriceEstimation(
        txs || [],
        txCallback,
        ProtocolAction.repayCollateral
      ),
    };
  }
}
