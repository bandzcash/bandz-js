import { BigNumber } from 'ethers';
import IERC20ServiceInterface from '../interfaces/ERC20';
import {
  Configuration,
  eSmartBCHTxType,
  SmartBCHTransactionTypeExtended,
  tSmartBCHAddress,
  transactionType,
  tStringCurrencyUnits,
  tStringDecimalUnits,
  TokenMetadataType,
} from '../types';
import { API_BCH_MOCK_ADDRESS, SUPER_BIG_ALLOWANCE_NUMBER } from '../config';
import { IERC20Detailed, IERC20Detailed__factory } from '../contract-types';
import BaseService from './BaseService';
import { parseNumber } from '../utils/parsings';

export default class ERC20Service
  extends BaseService<IERC20Detailed>
  implements IERC20ServiceInterface {
  readonly tokenDecimals: { [address: string]: number };

  constructor(config: Configuration) {
    super(config, IERC20Detailed__factory);
    this.tokenDecimals = {};
  }

  public approve = (
    user: tSmartBCHAddress,
    token: tSmartBCHAddress,
    spender: tSmartBCHAddress,
    amount: tStringDecimalUnits
  ): SmartBCHTransactionTypeExtended => {
    const erc20Contract = this.getContractInstance(token);

    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: () =>
        erc20Contract.populateTransaction.approve(spender, amount),
      from: user,
    });

    return {
      tx: txCallback,
      txType: eSmartBCHTxType.ERC20_APPROVAL,
      gas: this.generateTxPriceEstimation([], txCallback),
    };
  };

  public isApproved = async (
    token: tSmartBCHAddress,
    userAddress: tSmartBCHAddress,
    spender: tSmartBCHAddress,
    amount: tStringCurrencyUnits
  ): Promise<boolean> => {
    if (token.toLowerCase() === API_BCH_MOCK_ADDRESS.toLowerCase()) return true;
    const decimals = await this.decimalsOf(token);
    const erc20Contract: IERC20Detailed = this.getContractInstance(token);
    const allowance: BigNumber = await erc20Contract.allowance(
      userAddress,
      spender
    );
    const amountBNWithDecimals: BigNumber =
      amount === '-1'
        ? BigNumber.from(SUPER_BIG_ALLOWANCE_NUMBER)
        : BigNumber.from(parseNumber(amount, decimals));
    return allowance.gte(amountBNWithDecimals);
  };

  public decimalsOf = async (token: tSmartBCHAddress): Promise<number> => {
    if (token.toLowerCase() === API_BCH_MOCK_ADDRESS.toLowerCase()) return 18;
    if (!this.tokenDecimals[token]) {
      const erc20Contract = this.getContractInstance(token);
      this.tokenDecimals[token] = await erc20Contract.decimals();
    }

    return this.tokenDecimals[token];
  };

  public getTokenData = async (
    token: tSmartBCHAddress
  ): Promise<TokenMetadataType> => {
    if (token.toLowerCase() === API_BCH_MOCK_ADDRESS.toLowerCase()) {
      return {
        name: 'BitcoinCash',
        symbol: 'BCH',
        decimals: 18,
        address: token,
      };
    }
    // Needed because MKR does not return string for symbol and Name
    if (
      token.toLowerCase() ===
      '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2'.toLowerCase()
    ) {
      return {
        name: 'Maker',
        symbol: 'MKR',
        decimals: 18,
        address: token,
      };
    }

    const {
      name: nameGetter,
      symbol: symbolGetter,
      decimals: decimalsGetter,
    }: IERC20Detailed = this.getContractInstance(token);

    const [name, symbol, decimals]: [
      string,
      string,
      number
    ] = await Promise.all([nameGetter(), symbolGetter(), decimalsGetter()]);

    return {
      name,
      symbol,
      decimals,
      address: token,
    };
  };
}
