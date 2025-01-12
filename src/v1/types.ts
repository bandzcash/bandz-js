export enum BorrowRateMode {
  None = 'None',
  Stable = 'Stable',
  Variable = 'Variable',
}

export type ReserveRatesData = {
  id: string;
  symbol: string;
  paramsHistory: {
    variableBorrowIndex: string;
    liquidityIndex: string;
    timestamp: number;
  }[];
};

export type ReserveData = {
  id: string;
  underlyingAsset: string;
  name: string;
  symbol: string;
  decimals: number;
  isActive: boolean;
  isFreezed: boolean;
  usageAsCollateralEnabled: boolean;
  borrowingEnabled: boolean;
  stableBorrowRateEnabled: boolean;
  baseLTVasCollateral: string;
  optimalUtilisationRate: string;
  stableRateSlope1: string;
  stableRateSlope2: string;
  averageStableBorrowRate: string;
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
  totalBorrows: string;
  totalBorrowsStable: string;
  totalBorrowsVariable: string;
  totalLiquidity: string;
  utilizationRate: string;
  lastUpdateTimestamp: number;
  aToken: {
    id: string;
  };
  price: {
    priceInBch: string;
  };
};

export type UserReserveData = {
  principalATokenBalance: string;
  userBalanceIndex: string;
  redirectedBalance: string;
  interestRedirectionAddress: string;
  usageAsCollateralEnabledOnUser: boolean;
  borrowRate: string;
  borrowRateMode: BorrowRateMode;
  originationFee: string;
  principalBorrows: string;
  variableBorrowIndex: string;
  lastUpdateTimestamp: number;
  reserve: {
    id: string;
    underlyingAsset: string;
    name: string;
    symbol: string;
    decimals: number;
    liquidityRate: string;
    reserveLiquidationBonus: string;
    lastUpdateTimestamp: number;
    aToken: {
      id: string;
    };
  };
};

export type ComputedUserReserve = UserReserveData & {
  currentUnderlyingBalance: string;
  currentunderlyingBalanceBCH: string;
  currentUnderlyingBalanceUSD: string;

  currentBorrows: string;
  currentBorrowsBCH: string;
  currentBorrowsUSD: string;

  principalBorrowsBCH: string;
  principalBorrowsUSD: string;

  originationFeeBCH: string;
  originationFeeUSD: string;
};

export type UserSummaryData = {
  id: string;
  totalLiquidityBCH: string;
  totalCollateralBCH: string;
  totalBorrowsBCH: string;
  totalFeesBCH: string;
  totalFeesUSD: string;
  totalLiquidityUSD: string;
  totalCollateralUSD: string;
  totalBorrowsUSD: string;
  totalBorrowsWithFeesBCH: string;
  totalBorrowsWithFeesUSD: string;
  availableBorrowsBCH: string;
  currentLoanToValue: string;
  currentLiquidationThreshold: string;
  maxAmountToWithdrawInBch: string;
  healthFactor: string;
  reservesData: ComputedUserReserve[];
};
