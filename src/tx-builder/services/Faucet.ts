import { DEFAULT_NULL_VALUE_ON_TX } from '../config';
import {
  IFaucet,
  IMinter,
  IFaucet__factory,
  IMinter__factory,
} from '../contract-types';
import FaucetInterface from '../interfaces/Faucet';
import {
  Configuration,
  eSmartBCHTxType,
  SmartBCHTransactionTypeExtended,
  LendingPoolMarketConfig,
  transactionType,
} from '../types';
import { FaucetParamsType } from '../types/FaucetMethodTypes';
import { mintAmountsPerToken } from '../utils/parsings';
import { FaucetValidator } from '../validators/methodValidators';
import { IsBchAddress } from '../validators/paramValidators';
import BaseService from './BaseService';

export default class FaucetService
  extends BaseService<IMinter>
  implements FaucetInterface {
  readonly faucetAddress: string;

  readonly faucetContract: IFaucet;

  readonly faucetConfig: LendingPoolMarketConfig | undefined;

  constructor(
    config: Configuration,
    faucetConfig: LendingPoolMarketConfig | undefined
  ) {
    super(config, IMinter__factory);

    this.faucetConfig = faucetConfig;

    const { provider } = this.config;

    this.faucetAddress = this.faucetConfig?.FAUCET || '';

    if (this.faucetAddress !== '') {
      this.faucetContract = IFaucet__factory.connect(
        this.faucetAddress,
        provider
      );
    }
  }

  @FaucetValidator
  public async mint(
    @IsBchAddress('userAddress')
    @IsBchAddress('reserve')
    { userAddress, reserve, tokenSymbol }: FaucetParamsType
  ): Promise<SmartBCHTransactionTypeExtended[]> {
    const amount: string = mintAmountsPerToken[tokenSymbol];

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        this.faucetContract.populateTransaction.mint(reserve, amount),
      from: userAddress,
      value: DEFAULT_NULL_VALUE_ON_TX,
    });

    return [
      {
        tx: txCallback,
        txType: eSmartBCHTxType.FAUCET_MINT,
        gas: this.generateTxPriceEstimation([], txCallback),
      },
    ];
  }
}
