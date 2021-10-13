import BigNumber from 'bignumber.js';

export type ReserveRatesData = {
  id: string;
  symbol: string;
  paramsHistory: {
    variableBorrowIndex: string;
    liquidityIndex: string;
    timestamp: number;
  }[];
};

export type ReserveSupplyData = {
  totalScaledVariableDebt: string;
  variableBorrowIndex: string;
  variableBorrowRate: string;
  totalPrincipalStableDebt: string;
  averageStableRate: string;
  availableLiquidity: string;
  stableDebtLastUpdateTimestamp: number;
  lastUpdateTimestamp: number;
};

export type RewardsInformation = {
  rewardTokenAddress: string;
  rewardTokenDecimals: number;
  incentivePrecision: number;
  rewardTokenPriceBch: string;
  emissionEndTimestamp: number;
};

export type ReserveData = {
  id: string;
  underlyingAsset: string;
  name: string;
  symbol: string;
  decimals: number;
  isActive: boolean;
  isFrozen: boolean;
  usageAsCollateralEnabled: boolean;
  aTokenAddress: string;
  stableDebtTokenAddress: string;
  variableDebtTokenAddress: string;
  borrowingEnabled: boolean;
  stableBorrowRateEnabled: boolean;
  reserveFactor: string;
  baseLTVasCollateral: string;
  optimalUtilisationRate: string;
  stableRateSlope1: string;
  stableRateSlope2: string;
  averageStableRate: string;
  stableDebtLastUpdateTimestamp: number;
  baseVariableBorrowRate: string;
  variableRateSlope1: string;
  variableRateSlope2: string;
  liquidityIndex: string;
  reserveLiquidationThreshold: string;
  reserveLiquidationBonus: string;
  variableBorrowIndex: string;
  variableBorrowRate: string;
  avg30DaysVariableBorrowRate?: string;
  availableLiquidity: string;
  stableBorrowRate: string;
  liquidityRate: string;
  avg30DaysLiquidityRate?: string;
  totalPrincipalStableDebt: string;
  totalScaledVariableDebt: string;
  lastUpdateTimestamp: number;
  price: {
    priceInBch: string;
  };
  aEmissionPerSecond: string;
  vEmissionPerSecond: string;
  sEmissionPerSecond: string;
  aIncentivesLastUpdateTimestamp: number;
  vIncentivesLastUpdateTimestamp: number;
  sIncentivesLastUpdateTimestamp: number;
  aTokenIncentivesIndex: string;
  vTokenIncentivesIndex: string;
  sTokenIncentivesIndex: string;
};

export type ComputedReserveData = {
  utilizationRate: string;
  totalStableDebt: string;
  totalVariableDebt: string;
  totalDebt: string;
  totalLiquidity: string;
  aIncentivesAPY: string;
  vIncentivesAPY: string;
  sIncentivesAPY: string;
} & ReserveData;

export type Supplies = {
  totalVariableDebt: BigNumber;
  totalStableDebt: BigNumber;
  totalLiquidity: BigNumber;
};

export type UserReserveData = {
  scaledATokenBalance: string;
  usageAsCollateralEnabledOnUser: boolean;
  scaledVariableDebt: string;
  variableBorrowIndex: string;
  stableBorrowRate: string;
  principalStableDebt: string;
  stableBorrowLastUpdateTimestamp: number;
  reserve: {
    id: string;
    underlyingAsset: string;
    name: string;
    symbol: string;
    decimals: number;
    liquidityRate: string;
    reserveLiquidationBonus: string;
    lastUpdateTimestamp: number;
  };
  aTokenincentivesUserIndex: string;
  vTokenincentivesUserIndex: string;
  sTokenincentivesUserIndex: string;
};

export type ComputedUserReserve = UserReserveData & {
  underlyingBalance: string;
  underlyingBalanceBCH: string;
  underlyingBalanceUSD: string;

  variableBorrows: string;
  variableBorrowsBCH: string;
  variableBorrowsUSD: string;

  stableBorrows: string;
  stableBorrowsBCH: string;
  stableBorrowsUSD: string;

  totalBorrows: string;
  totalBorrowsBCH: string;
  totalBorrowsUSD: string;

  aTokenRewards: string;
  aTokenRewardsETH: string;
  aTokenRewardsUSD: string;
  vTokenRewards: string;
  vTokenRewardsBCH: string;
  vTokenRewardsUSD: string;
  sTokenRewards: string;
  sTokenRewardsBCH: string;
  sTokenRewardsUSD: string;
  totalRewards: string;
  totalRewardsBCH: string;
  totalRewardsUSD: string;
};

export type UserSummaryData = {
  id: string;
  totalLiquidityETH: string;
  totalLiquidityUSD: string;
  totalCollateralETH: string;
  totalCollateralUSD: string;
  totalBorrowsBCH: string;
  totalBorrowsUSD: string;
  availableBorrowsBCH: string;
  currentLoanToValue: string;
  currentLiquidationThreshold: string;
  healthFactor: string;
  reservesData: ComputedUserReserve[];
  totalRewards: string;
  totalRewardsBCH: string;
  totalRewardsUSD: string;
};
