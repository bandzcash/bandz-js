import { providers } from 'ethers';
import { Network, DefaultProviderKeys, TxBuilderConfig } from './types';
import TxBuilderInterface from './interfaces/TxBuilder';
import LendingPoolInterface from './interfaces/v2/LendingPool';
import LendingPool from './services/v2/LendingPool';
import BaseTxBuilder from './txBuilder';
import WETHGatewayInterface from './interfaces/WETHGateway';
import WETHGatewayService from './services/WETHGateway';
import BaseDebtTokenInterface from './interfaces/BaseDebtToken';
import BaseDebtToken from './services/BaseDebtToken';
import LiquiditySwapAdapterService from './services/LiquiditySwapAdapterParaswap';
import LiquiditySwapAdapterInterface from './interfaces/LiquiditySwapAdapterParaswap';
import RepayWithCollateralAdapterService from './services/RepayWithCollateralAdapter';
import RepayWithCollateralAdapterInterface from './interfaces/RepayWithCollateralAdapter';
import AaveGovernanceV2Interface from './interfaces/v2/AaveGovernanceV2';
import GovernanceDelegationTokenInterface from './interfaces/v2/GovernanceDelegationToken';
import AaveGovernanceV2Service from './services/v2/AaveGovernanceV2';
import GovernanceDelegationTokenService from './services/v2/GovernanceDelegationTokenService';

export default class TxBuilder
  extends BaseTxBuilder
  implements TxBuilderInterface {
  readonly lendingPools: {
    [market: string]: LendingPoolInterface;
  };

  readonly wethGateways: {
    [market: string]: WETHGatewayInterface;
  };

  readonly swapCollateralAdapters: {
    [market: string]: LiquiditySwapAdapterInterface;
  };

  readonly repayWithCollateralAdapters: {
    [market: string]: RepayWithCollateralAdapterInterface;
  };

  readonly baseDebtTokenService: BaseDebtTokenInterface;

  public aaveGovernanceV2Service: AaveGovernanceV2Interface;

  public governanceDelegationTokenService: GovernanceDelegationTokenInterface;

  constructor(
    network: Network = Network.mainnet,
    injectedProvider?:
      | providers.ExternalProvider
      | providers.Web3Provider
      | string
      | undefined,
    defaultProviderKeys?: DefaultProviderKeys,
    config?: TxBuilderConfig
  ) {
    super(network, injectedProvider, defaultProviderKeys, config);

    this.wethGateways = {};
    this.lendingPools = {};
    this.swapCollateralAdapters = {};
    this.repayWithCollateralAdapters = {};
    this.baseDebtTokenService = new BaseDebtToken(
      this.configuration,
      this.erc20Service
    );

    this.aaveGovernanceV2Service = new AaveGovernanceV2Service(
      this.configuration,
      this.txBuilderConfig.governance &&
      this.txBuilderConfig.governance[network]
        ? this.txBuilderConfig.governance[network]
        : undefined
    );

    this.governanceDelegationTokenService = new GovernanceDelegationTokenService(
      this.configuration
    );
  }

  public getRepayWithCollateralAdapter = (
    market: string
  ): RepayWithCollateralAdapterInterface => {
    const { network } = this.configuration;
    const repayConfig =
      this.txBuilderConfig.lendingPool &&
      this.txBuilderConfig.lendingPool[network]
        ? this.txBuilderConfig.lendingPool[network][market]
        : undefined;

    if (!this.repayWithCollateralAdapters[market]) {
      this.repayWithCollateralAdapters[
        market
      ] = new RepayWithCollateralAdapterService(
        this.configuration,
        repayConfig
      );
    }

    return this.repayWithCollateralAdapters[market];
  };

  public getSwapCollateralAdapter = (
    market: string
  ): LiquiditySwapAdapterInterface => {
    const { network } = this.configuration;
    const swapConfig =
      this.txBuilderConfig.lendingPool &&
      this.txBuilderConfig.lendingPool[network]
        ? this.txBuilderConfig.lendingPool[network][market]
        : undefined;

    if (!this.swapCollateralAdapters[market]) {
      this.swapCollateralAdapters[market] = new LiquiditySwapAdapterService(
        this.configuration,
        swapConfig
      );
    }

    return this.swapCollateralAdapters[market];
  };

  public getWethGateway = (market: string): WETHGatewayInterface => {
    const { network } = this.configuration;

    const wethConfig =
      this.txBuilderConfig.lendingPool &&
      this.txBuilderConfig.lendingPool[network]
        ? this.txBuilderConfig.lendingPool[network][market]
        : undefined;

    if (!this.wethGateways[market]) {
      this.wethGateways[market] = new WETHGatewayService(
        this.configuration,
        this.baseDebtTokenService,
        this.erc20Service,
        wethConfig
      );
    }

    return this.wethGateways[market];
  };

  public getLendingPool = (market: string): LendingPoolInterface => {
    const { network } = this.configuration;

    if (!this.lendingPools[market]) {
      const lendingPoolConfig =
        this.txBuilderConfig.lendingPool &&
        this.txBuilderConfig.lendingPool[network]
          ? this.txBuilderConfig.lendingPool[network][market]
          : undefined;

      this.lendingPools[market] = new LendingPool(
        this.configuration,
        this.erc20Service,
        this.synthetixService,
        this.getWethGateway(market),
        this.getSwapCollateralAdapter(market),
        this.getRepayWithCollateralAdapter(market),
        market,
        lendingPoolConfig
      );
    }

    return this.lendingPools[market];
  };
}
