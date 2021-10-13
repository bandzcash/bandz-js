import { constants } from 'ethers';
import {
  IAaveIncentivesController,
  IAaveIncentivesController__factory,
} from '../contract-types';
import {
  Configuration,
  eSmartBCHTxType,
  SmartBCHTransactionTypeExtended,
  IncentivesConfig,
  tSmartBCHAddress,
  transactionType,
} from '../types';
import { IncentivesValidator } from '../validators/methodValidators';
import { IsEthAddress } from '../validators/paramValidators';
import BaseService from './BaseService';

export type ClaimRewardsMethodType = {
  user: string;
  assets: string[];
  to: string;
};

export interface IncentivesControllerInterface {
  incentivesControllerRewardTokenAddress: tSmartBCHAddress;
  claimRewards: (
    args: ClaimRewardsMethodType
  ) => SmartBCHTransactionTypeExtended[];
}

export default class IncentivesController
  extends BaseService<IAaveIncentivesController>
  implements IncentivesControllerInterface {
  public readonly incentivesControllerRewardTokenAddress: tSmartBCHAddress;
  readonly incentivesControllerAddress: string;

  readonly incentivesConfig: IncentivesConfig | undefined;

  constructor(
    config: Configuration,
    incentivesConfig: IncentivesConfig | undefined
  ) {
    super(config, IAaveIncentivesController__factory);
    this.incentivesConfig = incentivesConfig;

    const { INCENTIVES_CONTROLLER, INCENTIVES_CONTROLLER_REWARD_TOKEN } =
      this.incentivesConfig || {};

    this.incentivesControllerAddress = INCENTIVES_CONTROLLER || '';
    this.incentivesControllerRewardTokenAddress =
      INCENTIVES_CONTROLLER_REWARD_TOKEN || '';
  }

  @IncentivesValidator
  public claimRewards(
    @IsEthAddress('user')
    // @IsEthAddressArray('assets')
    @IsEthAddress('to')
    { user, assets, to }: ClaimRewardsMethodType
  ): SmartBCHTransactionTypeExtended[] {
    const incentivesContract: IAaveIncentivesController = this.getContractInstance(
      this.incentivesControllerAddress
    );
    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        incentivesContract.populateTransaction.claimRewards(
          assets,
          constants.MaxUint256.toString(),
          to || user
        ),
      from: user,
    });

    return [
      {
        tx: txCallback,
        txType: eSmartBCHTxType.REWARD_ACTION,
        gas: this.generateTxPriceEstimation([], txCallback),
      },
    ];
  }
}
