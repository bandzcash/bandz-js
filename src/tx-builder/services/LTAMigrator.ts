import IERC20ServiceInterface from '../interfaces/ERC20';
import { DEFAULT_APPROVE_AMOUNT } from '../config';
import {
  ILendToAaveMigrator,
  ILendToAaveMigrator__factory,
} from '../contract-types';
import LTAMigratorInterface from '../interfaces/LTAMigrator';
import {
  Configuration,
  eSmartBCHTxType,
  SmartBCHTransactionTypeExtended,
  MigratorConfig,
  tSmartBCHAddress,
  transactionType,
  tStringCurrencyUnits,
} from '../types';
import { parseNumber } from '../utils/parsings';
import BaseService from './BaseService';
import { LTAMigratorValidator } from '../validators/methodValidators';
import { IsEthAddress, IsPositiveAmount } from '../validators/paramValidators';

export default class LTAMigratorService
  extends BaseService<ILendToAaveMigrator>
  implements LTAMigratorInterface {
  readonly erc20Service: IERC20ServiceInterface;

  readonly migratorAddress: string;

  readonly migratorConfig: MigratorConfig | undefined;

  constructor(
    config: Configuration,
    erc20Service: IERC20ServiceInterface,
    migratorConfig: MigratorConfig | undefined
  ) {
    super(config, ILendToAaveMigrator__factory);
    this.erc20Service = erc20Service;
    this.migratorConfig = migratorConfig;

    this.migratorAddress = this.migratorConfig?.LEND_TO_AAVE_MIGRATOR || '';
  }

  @LTAMigratorValidator
  public async migrateLendToAave(
    @IsEthAddress() user: tSmartBCHAddress,
    @IsPositiveAmount() amount: tStringCurrencyUnits
  ): Promise<SmartBCHTransactionTypeExtended[]> {
    const txs: SmartBCHTransactionTypeExtended[] = [];

    const { isApproved, approve, decimalsOf } = this.erc20Service;

    const migratorContract: ILendToAaveMigrator = this.getContractInstance(
      this.migratorAddress
    );
    const lendToken: string = await migratorContract.LEND();

    const approved: boolean = await isApproved(
      lendToken,
      user,
      this.migratorAddress,
      amount
    );

    if (!approved) {
      txs.push(
        approve(user, lendToken, this.migratorAddress, DEFAULT_APPROVE_AMOUNT)
      );
    }

    const decimals: number = await decimalsOf(lendToken);
    const convertedAmount: string = await parseNumber(amount, decimals);

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        migratorContract.populateTransaction.migrateFromLEND(convertedAmount),
      from: user,
    });

    txs.push({
      txType: eSmartBCHTxType.MIGRATION_LEND_AAVE,
      tx: txCallback,
      gas: this.generateTxPriceEstimation(txs, txCallback),
    });

    return txs;
  }
}
