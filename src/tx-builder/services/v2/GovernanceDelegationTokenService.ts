import { splitSignature } from 'ethers/lib/utils';
import {
  IGovernancePowerDelegationToken,
  IGovernancePowerDelegationToken__factory,
} from '../../contract-types';
import GovernanceDelegationTokenInterface from '../../interfaces/v2/GovernanceDelegationToken';
import {
  ChainId,
  Configuration,
  eSmartBCHTxType,
  SmartBCHTransactionTypeExtended,
  tSmartBCHAddress,
  transactionType,
  tStringDecimalUnits,
} from '../../types';
import {
  GovDelegate,
  GovDelegateBySig,
  GovDelegateByType,
  GovDelegateByTypeBySig,
  GovGetDelegateeByType,
  GovGetNonce,
  GovGetPowerAtBlock,
  GovGetPowerCurrent,
  GovPrepareDelegateSig,
  GovPrepareDelegateSigByType,
} from '../../types/GovDelegationMethodTypes';
import { canBeEnsAddress } from '../../utils/parsings';
import { GovDelegationValidator } from '../../validators/methodValidators';
import {
  Is0OrPositiveAmount,
  IsBchAddress,
  IsBchAddressOrENS,
  IsPositiveAmount,
} from '../../validators/paramValidators';
import BaseService from '../BaseService';

export default class GovernanceDelegationTokenService
  extends BaseService<IGovernancePowerDelegationToken>
  implements GovernanceDelegationTokenInterface {
  constructor(config: Configuration) {
    super(config, IGovernancePowerDelegationToken__factory);
  }

  @GovDelegationValidator
  public async delegate(
    @IsBchAddress('user')
    @IsBchAddressOrENS('delegatee')
    @IsBchAddress('governanceToken')
    { user, delegatee, governanceToken }: GovDelegate
  ): Promise<SmartBCHTransactionTypeExtended[]> {
    const txs: SmartBCHTransactionTypeExtended[] = [];
    const governanceDelegationToken: IGovernancePowerDelegationToken = this.getContractInstance(
      governanceToken
    );

    const delegateeAddress: string = await this.getDelegateeAddress(delegatee);

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        governanceDelegationToken.populateTransaction.delegate(
          delegateeAddress
        ),
      from: user,
    });

    txs.push({
      tx: txCallback,
      txType: eSmartBCHTxType.GOV_DELEGATION_ACTION,
      gas: this.generateTxPriceEstimation(txs, txCallback),
    });

    return txs;
  }

  @GovDelegationValidator
  public async delegateByType(
    @IsBchAddress('user')
    @IsBchAddressOrENS('delegatee')
    @IsBchAddress('governanceToken')
    { user, delegatee, delegationType, governanceToken }: GovDelegateByType
  ): Promise<SmartBCHTransactionTypeExtended[]> {
    const txs: SmartBCHTransactionTypeExtended[] = [];
    const governanceDelegationToken: IGovernancePowerDelegationToken = this.getContractInstance(
      governanceToken
    );

    const delegateeAddress: string = await this.getDelegateeAddress(delegatee);

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        governanceDelegationToken.populateTransaction.delegateByType(
          delegateeAddress,
          delegationType
        ),
      from: user,
    });

    txs.push({
      tx: txCallback,
      txType: eSmartBCHTxType.GOV_DELEGATION_ACTION,
      gas: this.generateTxPriceEstimation(txs, txCallback),
    });

    return txs;
  }

  @GovDelegationValidator
  public async delegateBySig(
    @IsBchAddress('user')
    @IsBchAddressOrENS('delegatee')
    @IsBchAddress('governanceToken')
    { user, delegatee, expiry, signature, governanceToken }: GovDelegateBySig
  ): Promise<SmartBCHTransactionTypeExtended[]> {
    const txs: SmartBCHTransactionTypeExtended[] = [];
    const governanceDelegationToken: IGovernancePowerDelegationToken = this.getContractInstance(
      governanceToken
    );
    const nonce = await this.getNonce({ user, governanceToken });
    const { v, r, s } = splitSignature(signature);

    const delegateeAddress: string = await this.getDelegateeAddress(delegatee);

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        governanceDelegationToken.populateTransaction.delegateBySig(
          delegateeAddress,
          nonce,
          expiry,
          v,
          r,
          s
        ),
      from: user,
    });

    txs.push({
      tx: txCallback,
      txType: eSmartBCHTxType.GOV_DELEGATION_ACTION,
      gas: this.generateTxPriceEstimation(txs, txCallback),
    });

    return txs;
  }

  @GovDelegationValidator
  public async delegateByTypeBySig(
    @IsBchAddress('user')
    @IsBchAddressOrENS('delegatee')
    @IsBchAddress('governanceToken')
    {
      user,
      delegatee,
      delegationType,
      expiry,
      signature,
      governanceToken,
    }: GovDelegateByTypeBySig
  ): Promise<SmartBCHTransactionTypeExtended[]> {
    const txs: SmartBCHTransactionTypeExtended[] = [];
    const governanceDelegationToken: IGovernancePowerDelegationToken = this.getContractInstance(
      governanceToken
    );
    const nonce = await this.getNonce({ user, governanceToken });
    const { v, r, s } = splitSignature(signature);

    const delegateeAddress: string = await this.getDelegateeAddress(delegatee);

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        governanceDelegationToken.populateTransaction.delegateByTypeBySig(
          delegateeAddress,
          delegationType,
          nonce,
          expiry,
          v,
          r,
          s
        ),
      from: user,
    });

    txs.push({
      tx: txCallback,
      txType: eSmartBCHTxType.GOV_DELEGATION_ACTION,
      gas: this.generateTxPriceEstimation(txs, txCallback),
    });

    return txs;
  }

  @GovDelegationValidator
  public async prepareDelegateSignature(
    @IsBchAddressOrENS('delegatee')
    @IsBchAddress('governanceToken')
    @Is0OrPositiveAmount('nonce')
    {
      delegatee,
      nonce,
      expiry,
      governanceTokenName,
      governanceToken,
    }: GovPrepareDelegateSig
  ): Promise<string> {
    const delegateeAddress: string = await this.getDelegateeAddress(delegatee);

    const typeData = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Delegate: [
          { name: 'delegatee', type: 'address' },
          { name: 'nonce', type: 'uint256' },
          { name: 'expiry', type: 'uint256' },
        ],
      },
      primaryType: 'Delegate' as const,
      domain: {
        name: governanceTokenName,
        chainId: ChainId[this.config.network],
        verifyingContract: governanceToken,
      },
      message: {
        delegatee: delegateeAddress,
        nonce,
        expiry,
      },
    };

    return JSON.stringify(typeData);
  }

  @GovDelegationValidator
  public async prepareDelegateByTypeSignature(
    @IsBchAddressOrENS('delegatee')
    @IsBchAddress('governanceToken')
    @Is0OrPositiveAmount('nonce')
    {
      delegatee,
      type,
      nonce,
      expiry,
      governanceTokenName,
      governanceToken,
    }: GovPrepareDelegateSigByType
  ): Promise<string> {
    const delegateeAddress: string = await this.getDelegateeAddress(delegatee);

    const typeData = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        DelegateByType: [
          { name: 'delegatee', type: 'address' },
          { name: 'type', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'expiry', type: 'uint256' },
        ],
      },
      primaryType: 'DelegateByType' as const,
      domain: {
        name: governanceTokenName,
        chainId: ChainId[this.config.network],
        verifyingContract: governanceToken,
      },
      message: {
        delegatee: delegateeAddress,
        type,
        nonce,
        expiry,
      },
    };

    return JSON.stringify(typeData);
  }

  @GovDelegationValidator
  public async getDelegateeByType(
    @IsBchAddress('delegator')
    @IsBchAddress('governanceToken')
    { delegator, delegationType, governanceToken }: GovGetDelegateeByType
  ): Promise<tSmartBCHAddress> {
    const governanceDelegationToken: IGovernancePowerDelegationToken = this.getContractInstance(
      governanceToken
    );
    return governanceDelegationToken.getDelegateeByType(
      delegator,
      delegationType
    );
  }

  @GovDelegationValidator
  public async getPowerCurrent(
    @IsBchAddress('user')
    @IsBchAddress('governanceToken')
    { user, delegationType, governanceToken }: GovGetPowerCurrent
  ): Promise<tStringDecimalUnits> {
    const governanceDelegationToken: IGovernancePowerDelegationToken = this.getContractInstance(
      governanceToken
    );
    return (
      await governanceDelegationToken.getPowerCurrent(user, delegationType)
    ).toString();
  }

  @GovDelegationValidator
  public async getPowerAtBlock(
    @IsBchAddress('user')
    @IsBchAddress('governanceToken')
    @IsPositiveAmount('blockNumber')
    { user, blockNumber, delegationType, governanceToken }: GovGetPowerAtBlock
  ): Promise<tStringDecimalUnits> {
    const governanceDelegationToken: IGovernancePowerDelegationToken = this.getContractInstance(
      governanceToken
    );
    return (
      await governanceDelegationToken.getPowerAtBlock(
        user,
        blockNumber,
        delegationType
      )
    ).toString();
  }

  @GovDelegationValidator
  public async getNonce(
    @IsBchAddress('user')
    @IsBchAddress('governanceToken')
    { user, governanceToken }: GovGetNonce
  ): Promise<tStringDecimalUnits> {
    const governanceDelegationToken: IGovernancePowerDelegationToken = this.getContractInstance(
      governanceToken
    );
    // eslint-disable-next-line no-underscore-dangle
    return (await governanceDelegationToken._nonces(user)).toString();
  }

  private async getDelegateeAddress(delegatee: string): Promise<string> {
    if (canBeEnsAddress(delegatee)) {
      const delegateeAddress = await this.config.provider.resolveName(
        delegatee
      );
      if (!delegateeAddress)
        throw new Error(`Address ${delegatee} is not a valid ENS address`);

      return delegateeAddress;
    }

    return delegatee;
  }
}
