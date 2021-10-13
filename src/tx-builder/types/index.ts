import { providers, BigNumber, BytesLike, PopulatedTransaction } from 'ethers';

export type tSmartBCHAddress = string;
export type tStringCurrencyUnits = string; // ex 2.5 bch
export type tStringDecimalUnits = string; // ex 2500000000000000000
export type ENS = string; // something.eth

/** InterestRate options */
export enum InterestRate {
  None = 'None',
  Stable = 'Stable',
  Variable = 'Variable',
}

export enum Market {
  Proto = 'proto',
  AMM = 'amm',
}

export enum Network {
  mainnet = 'mainnet',
  amber = 'amber',
  kovan = 'kovan',
  polygon = 'polygon',
  fork = 'fork',
  mumbai = 'mumbai',
  polygon_fork = 'polygon_fork',
  avalanche = 'avalanche',
  avalanche_fork = 'avalanche_fork',
  fuji = 'fuji', // avalanche test network
  arbitrum_one = 'arbitrum_one',
  arbitrum_rinkeby = 'arbitrum_rinkeby',
}

export enum ChainId {
  mainnet = 10000,
  amber = 10001,
  kovan = 42,
  polygon = 137,
  fork = 1337,
  mumbai = 80001,
  polygon_fork = 1338,
  avalanche = 43114,
  avalanche_fork = 1337,
  fuji = 43113, // avalanche test network
  arbitrum_one = 42161,
  arbitrum_rinkeby = 421611,
}
export type ConstantAddressesByNetwork = {
  [network: string]: {
    SYNTHETIX_PROXY_ADDRESS?: tSmartBCHAddress;
  };
};
export type GovernanceConfig = {
  BANDZ_GOVERNANCE_V2: tSmartBCHAddress;
  BANDZ_GOVERNANCE_V2_EXECUTOR_SHORT: tSmartBCHAddress;
  BANDZ_GOVERNANCE_V2_EXECUTOR_LONG: tSmartBCHAddress;
  BANDZ_GOVERNANCE_V2_HELPER: tSmartBCHAddress;
};

export type IncentivesConfig = {
  INCENTIVES_CONTROLLER: tSmartBCHAddress;
  INCENTIVES_CONTROLLER_REWARD_TOKEN: tSmartBCHAddress;
};

export type MigratorConfig = {
  LEND_TO_AAVE_MIGRATOR: tSmartBCHAddress;
};

export type LendingPoolMarketConfig = {
  LENDING_POOL: tSmartBCHAddress;
  WBCH_GATEWAY?: tSmartBCHAddress;
  FLASH_LIQUIDATION_ADAPTER?: tSmartBCHAddress;
  REPAY_WITH_COLLATERAL_ADAPTER?: tSmartBCHAddress;
  SWAP_COLLATERAL_ADAPTER?: tSmartBCHAddress;
  FAUCET?: tSmartBCHAddress;
};

export type LendingPoolConfig = {
  [network: string]: {
    [market: string]: LendingPoolMarketConfig;
  };
};

export type StakingNetworkConfig = {
  TOKEN_STAKING: tSmartBCHAddress;
  STAKING_REWARD_TOKEN: tSmartBCHAddress;
  STAKING_HELPER?: tSmartBCHAddress;
};

export type StakingConfig = {
  [network: string]: { [stake: string]: StakingNetworkConfig };
};

export type TxBuilderConfig = {
  governance?: {
    [network: string]: GovernanceConfig;
  };
  incentives?: {
    [network: string]: IncentivesConfig;
  };
  migrator?: { [network: string]: MigratorConfig };
  lendingPool?: LendingPoolConfig;
  staking?: StakingConfig;
};

export enum eSmartBCHTxType {
  ERC20_APPROVAL = 'ERC20_APPROVAL',
  DLP_ACTION = 'DLP_ACTION',
  GOVERNANCE_ACTION = 'GOVERNANCE_ACTION',
  GOV_DELEGATION_ACTION = 'GOV_DELEGATION_ACTION',
  STAKE_ACTION = 'STAKE_ACTION',
  MIGRATION_LEND_AAVE = 'MIGRATION_LEND_AAVE',
  FAUCET_MINT = 'FAUCET_MINT',
  REWARD_ACTION = 'REWARD_ACTION',
}

export enum ProtocolAction {
  default = 'default',
  withdraw = 'withdraw',
  deposit = 'deposit',
  liquidationCall = 'liquidationCall',
  liquidationFlash = 'liquidationFlash',
  repay = 'repay',
  swapCollateral = 'swapCollateral',
  repayCollateral = 'repayCollateral',
  withdrawBCH = 'withdrawBCH',
  borrowBCH = 'borrwoETH',
}

export enum GovernanceVote {
  Abstain = 0,
  Yes = 1,
  No = 2,
}

export enum Stake {
  bandz = 'bandz',
  bpt = 'bpt',
}

export type GasRecommendationType = {
  [action: string]: {
    limit: string;
    recommended: string;
  };
};

export type GeneratedTx = {
  tx: transactionType;
  gas: {
    price: string;
    limit: string;
  };
};

export type transactionType = {
  value?: string;
  from?: string;
  to?: string;
  nonce?: number;
  gasLimit?: BigNumber;
  gasPrice?: BigNumber;
  data?: string;
  chainId?: number;
};

export type AddressModel = {
  ADDRESS_PROVIDER_ADDRESS: tSmartBCHAddress;
  LENDINGPOOL_ADDRESS: tSmartBCHAddress;
  LENDINGPOOL_CORE_ADDRESS: tSmartBCHAddress;
  SYNTHETIX_PROXY_ADDRESS: tSmartBCHAddress;
  GOVERNANCE_PROTO_CONTRACT: tSmartBCHAddress;
  LEND_TO_AAVE_MIGRATOR: tSmartBCHAddress;
  WBCH_GATEWAY: tSmartBCHAddress;
  FAUCET: tSmartBCHAddress;
  SWAP_COLLATERAL_ADAPTER: tSmartBCHAddress;
  REPAY_WITH_COLLATERAL_ADAPTER: tSmartBCHAddress;
  BANDZ_GOVERNANCE_V2: tSmartBCHAddress;
  BANDZ_GOVERNANCE_V2_EXECUTOR_SHORT: tSmartBCHAddress;
  BANDZ_GOVERNANCE_V2_EXECUTOR_LONG: tSmartBCHAddress;
  BANDZ_GOVERNANCE_V2_HELPER: tSmartBCHAddress;
  FLASHLIQUIDATION: tSmartBCHAddress;
  INCENTIVES_CONTROLLER: tSmartBCHAddress;
  INCENTIVES_CONTROLLER_REWARD_TOKEN: tSmartBCHAddress;
};

export type tCommonContractAddressBetweenMarkets = Pick<
  AddressModel,
  | 'SYNTHETIX_PROXY_ADDRESS'
  | 'GOVERNANCE_PROTO_CONTRACT'
  | 'LEND_TO_AAVE_MIGRATOR'
  | 'WBCH_GATEWAY'
  | 'FAUCET'
  | 'SWAP_COLLATERAL_ADAPTER'
  | 'REPAY_WITH_COLLATERAL_ADAPTER'
  | 'FLASHLIQUIDATION'
  | 'INCENTIVES_CONTROLLER'
  | 'INCENTIVES_CONTROLLER_REWARD_TOKEN'
>;

export type tDistinctContractAddressBetweenMarkets = Pick<
  AddressModel,
  | 'ADDRESS_PROVIDER_ADDRESS'
  | 'LENDINGPOOL_ADDRESS'
  | 'LENDINGPOOL_CORE_ADDRESS'
>;

export type tDistinctContractAddressBetweenMarketsV2 = Pick<
  AddressModel,
  'LENDINGPOOL_ADDRESS'
>;

export type tDistinctGovernanceV2Addresses = Pick<
  AddressModel,
  | 'BANDZ_GOVERNANCE_V2'
  | 'BANDZ_GOVERNANCE_V2_EXECUTOR_SHORT'
  | 'BANDZ_GOVERNANCE_V2_EXECUTOR_LONG'
  | 'BANDZ_GOVERNANCE_V2_HELPER'
>;

export type tdistinctStakingAddressesBetweenTokens = {
  TOKEN_STAKING_ADDRESS: tSmartBCHAddress;
  STAKING_REWARD_TOKEN_ADDRESS: tSmartBCHAddress;
  STAKING_HELPER_ADDRESS: tSmartBCHAddress;
  canUsePermit: boolean;
};

export type ContractAddresses = {
  [contractName: string]: tSmartBCHAddress;
};

export type Configuration = {
  network: Network;
  provider: providers.Provider;
};

export type SmartBCHTransactionTypeExtended = {
  txType: eSmartBCHTxType;
  tx: () => Promise<transactionType>;
  gas: GasResponse;
};

export type TransactionGenerationMethod = {
  rawTxMethod: () => Promise<PopulatedTransaction>;
  from: tSmartBCHAddress;
  value?: string;
  gasSurplus?: number;
  action?: ProtocolAction;
};

export type TransactionGasGenerationMethod = {
  txCallback: () => Promise<transactionType>;
  action?: ProtocolAction;
};

export type GasType = {
  gasLimit: string | undefined;
  gasPrice: string;
};
export type GasResponse = (force?: boolean) => Promise<GasType | null>;

export type TokenMetadataType = {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
};

export type DefaultProviderKeys = {
  etherscan?: string;
  infura?: string;
  alchemy?: string;
};

export type GovernanceConfigType = {
  [network: string]: tDistinctGovernanceV2Addresses;
};
export type StakingConfigType = {
  [sToken: string]: {
    [network: string]: tdistinctStakingAddressesBetweenTokens;
  };
};

export type CommonConfigType = {
  [network: string]: tCommonContractAddressBetweenMarkets;
};

export type LendingPoolConfigType = {
  [pool: string]: {
    [network: string]: tDistinctContractAddressBetweenMarketsV2;
  };
};

export type EnabledNetworksType = {
  staking: {
    [sToken: string]: Network[];
  };
  lendingPool: {
    [market: string]: Network[];
  };
  governance: Network[];
  WBCHGateway: Network[];
  faucet: Network[];
  liquiditySwapAdapter: Network[];
  repayWithCollateralAdapter: Network[];
  bandzGovernanceV2: Network[];
  ltaMigrator: Network[];
  incentivesController: Network[];
};

export type PermitSignature = {
  amount: tStringCurrencyUnits;
  deadline: string;
  v: number;
  r: BytesLike;
  s: BytesLike;
};

export type FlashLoanParams = {
  assetToSwapToList: tSmartBCHAddress[]; // List of the addresses of the reserve to be swapped to and deposited
  minAmountsToReceive: string[]; // List of min amounts to be received from the swap
  swapAllBalance: boolean[]; // Flag indicating if all the user balance should be swapped
  permitAmount: string[]; // List of amounts for the permit signature
  deadline: string[]; // List of deadlines for the permit signature
  v: number[]; // List of v param for the permit signature
  r: BytesLike[]; // List of r param for the permit signature
  s: BytesLike[]; // List of s param for the permit signature
};
