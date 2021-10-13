import BigNumber from 'bignumber.js';

import {
  BigNumberValue,
  valueToBigNumber,
  valueToZDBigNumber,
  normalize,
  pow10,
  normalizeBN,
} from '../helpers/bignumber';
import {
  calculateavailableBorrowsBCH,
  calculateHealthFactorFromBalances,
  getCompoundedBalance,
  getCompoundedStableBalance,
  calculateAverageRate,
  LTV_PRECISION,
  calculateCompoundedInterest,
  getLinearBalance,
} from '../helpers/pool-math';
import { rayDiv, rayMul } from '../helpers/ray-math';
import {
  ComputedUserReserve,
  ReserveData,
  UserReserveData,
  UserSummaryData,
  ReserveRatesData,
  ComputedReserveData,
  Supplies,
  ReserveSupplyData,
  RewardsInformation,
} from './types';
import {
  BCH_DECIMALS,
  RAY_DECIMALS,
  SECONDS_PER_YEAR,
  USD_DECIMALS,
} from '../helpers/constants';

export function getBchAndUsdBalance(
  balance: BigNumberValue,
  priceInBch: BigNumberValue,
  decimals: number,
  usdPriceBch: BigNumberValue
): [string, string] {
  const balanceInBch = valueToZDBigNumber(balance)
    .multipliedBy(priceInBch)
    .dividedBy(pow10(decimals));
  const balanceInUsd = balanceInBch
    .multipliedBy(pow10(USD_DECIMALS))
    .dividedBy(usdPriceBch)
    .toFixed(0);
  return [balanceInBch.toString(), balanceInUsd];
}

/*
type ComputeUserReserveDataPoolReserve = Pick<
  ReserveData,
  | 'price'
  | 'decimals'
  | 'liquidityIndex'
  | 'liquidityRate'
  | 'lastUpdateTimestamp'
  | 'variableBorrowIndex'
  | 'variableBorrowRate'
>;

type ComputeUserReserveDataUserReserve = Pick<
  UserReserveData,
  | 'scaledATokenBalance'
  | 'scaledVariableDebt'
  | 'principalStableDebt'
  | 'stableBorrowRate'
  | 'stableBorrowLastUpdateTimestamp'
>;
*/

export function computeUserReserveData(
  poolReserve: ReserveData,
  userReserve: UserReserveData,
  usdPriceBch: BigNumberValue,
  currentTimestamp: number,
  rewardsInfo: RewardsInformation
): ComputedUserReserve {
  const {
    price: { priceInBch },
    decimals,
  } = poolReserve;
  const underlyingBalance = getLinearBalance(
    userReserve.scaledATokenBalance,
    poolReserve.liquidityIndex,
    poolReserve.liquidityRate,
    poolReserve.lastUpdateTimestamp,
    currentTimestamp
  ).toString();
  const [underlyingBalanceBCH, underlyingBalanceUSD] = getBchAndUsdBalance(
    underlyingBalance,
    priceInBch,
    decimals,
    usdPriceBch
  );

  const variableBorrows = getCompoundedBalance(
    userReserve.scaledVariableDebt,
    poolReserve.variableBorrowIndex,
    poolReserve.variableBorrowRate,
    poolReserve.lastUpdateTimestamp,
    currentTimestamp
  ).toString();

  const [variableBorrowsBCH, variableBorrowsUSD] = getBchAndUsdBalance(
    variableBorrows,
    priceInBch,
    decimals,
    usdPriceBch
  );

  const stableBorrows = getCompoundedStableBalance(
    userReserve.principalStableDebt,
    userReserve.stableBorrowRate,
    userReserve.stableBorrowLastUpdateTimestamp,
    currentTimestamp
  ).toString();

  const [stableBorrowsBCH, stableBorrowsUSD] = getBchAndUsdBalance(
    stableBorrows,
    priceInBch,
    decimals,
    usdPriceBch
  );
  const {
    totalLiquidity,
    totalStableDebt,
    totalVariableDebt,
  } = calculateSupplies(
    {
      totalScaledVariableDebt: poolReserve.totalScaledVariableDebt,
      variableBorrowIndex: poolReserve.variableBorrowIndex,
      variableBorrowRate: poolReserve.variableBorrowRate,
      totalPrincipalStableDebt: poolReserve.totalPrincipalStableDebt,
      averageStableRate: poolReserve.averageStableRate,
      availableLiquidity: poolReserve.availableLiquidity,
      stableDebtLastUpdateTimestamp: poolReserve.stableDebtLastUpdateTimestamp,
      lastUpdateTimestamp: poolReserve.lastUpdateTimestamp,
    },
    currentTimestamp
  );

  const aTokenRewards = totalLiquidity.gt(0)
    ? calculateRewards(
        userReserve.scaledATokenBalance,
        poolReserve.aTokenIncentivesIndex,
        userReserve.aTokenincentivesUserIndex,
        rewardsInfo.incentivePrecision,
        rewardsInfo.rewardTokenDecimals,
        poolReserve.aIncentivesLastUpdateTimestamp,
        poolReserve.aEmissionPerSecond,
        rayDiv(totalLiquidity, poolReserve.liquidityIndex),
        currentTimestamp,
        rewardsInfo.emissionEndTimestamp
      )
    : '0';

  const [aTokenRewardsBCH, aTokenRewardsUSD] = getBchAndUsdBalance(
    aTokenRewards,
    rewardsInfo.rewardTokenPriceBch,
    rewardsInfo.rewardTokenDecimals,
    usdPriceBch
  );

  const vTokenRewards = totalVariableDebt.gt(0)
    ? calculateRewards(
        userReserve.scaledVariableDebt,
        poolReserve.vTokenIncentivesIndex,
        userReserve.vTokenincentivesUserIndex,
        rewardsInfo.incentivePrecision,
        rewardsInfo.rewardTokenDecimals,
        poolReserve.vIncentivesLastUpdateTimestamp,
        poolReserve.vEmissionPerSecond,
        new BigNumber(poolReserve.totalScaledVariableDebt),
        currentTimestamp,
        rewardsInfo.emissionEndTimestamp
      )
    : '0';

  const [vTokenRewardsBCH, vTokenRewardsUSD] = getBchAndUsdBalance(
    vTokenRewards,
    rewardsInfo.rewardTokenPriceBch,
    rewardsInfo.rewardTokenDecimals,
    usdPriceBch
  );
  const sTokenRewards = totalStableDebt.gt(0)
    ? calculateRewards(
        userReserve.principalStableDebt,
        poolReserve.sTokenIncentivesIndex,
        userReserve.sTokenincentivesUserIndex,
        rewardsInfo.incentivePrecision,
        rewardsInfo.rewardTokenDecimals,
        poolReserve.sIncentivesLastUpdateTimestamp,
        poolReserve.sEmissionPerSecond,
        new BigNumber(poolReserve.totalPrincipalStableDebt),
        currentTimestamp,
        rewardsInfo.emissionEndTimestamp
      )
    : '0';

  const [sTokenRewardsBCH, sTokenRewardsUSD] = getBchAndUsdBalance(
    sTokenRewards,
    rewardsInfo.rewardTokenPriceBch,
    rewardsInfo.rewardTokenDecimals,
    usdPriceBch
  );

  return {
    ...userReserve,
    underlyingBalance,
    underlyingBalanceBCH,
    underlyingBalanceUSD,
    variableBorrows,
    variableBorrowsBCH,
    variableBorrowsUSD,
    stableBorrows,
    stableBorrowsBCH,
    stableBorrowsUSD,
    totalBorrows: valueToZDBigNumber(variableBorrows)
      .plus(stableBorrows)
      .toString(),
    totalBorrowsBCH: valueToZDBigNumber(variableBorrowsBCH)
      .plus(stableBorrowsBCH)
      .toString(),
    totalBorrowsUSD: valueToZDBigNumber(variableBorrowsUSD)
      .plus(stableBorrowsUSD)
      .toString(),
    aTokenRewards,
    aTokenRewardsBCH,
    aTokenRewardsUSD,
    vTokenRewards,
    vTokenRewardsBCH,
    vTokenRewardsUSD,
    sTokenRewards,
    sTokenRewardsBCH,
    sTokenRewardsUSD,
    totalRewards: valueToZDBigNumber(aTokenRewards)
      .plus(vTokenRewards)
      .plus(sTokenRewards)
      .toString(),
    totalRewardsBCH: valueToZDBigNumber(aTokenRewardsBCH)
      .plus(vTokenRewardsBCH)
      .plus(sTokenRewardsBCH)
      .toString(),
    totalRewardsUSD: valueToZDBigNumber(aTokenRewardsUSD)
      .plus(vTokenRewardsUSD)
      .plus(sTokenRewardsUSD)
      .toString(),
  };
}

export function computeRawUserSummaryData(
  poolReservesData: ReserveData[],
  rawUserReserves: UserReserveData[],
  userId: string,
  usdPriceBch: BigNumberValue,
  currentTimestamp: number,
  rewardsInfo: RewardsInformation
): UserSummaryData {
  let totalLiquidityBCH = valueToZDBigNumber('0');
  let totalCollateralBCH = valueToZDBigNumber('0');
  let totalBorrowsBCH = valueToZDBigNumber('0');
  let currentLtv = valueToBigNumber('0');
  let currentLiquidationThreshold = valueToBigNumber('0');

  let totalRewards = valueToBigNumber('0');
  let totalRewardsBCH = valueToBigNumber('0');
  let totalRewardsUSD = valueToBigNumber('0');

  const userReservesData = rawUserReserves
    .map((userReserve) => {
      const poolReserve = poolReservesData.find(
        (reserve) => reserve.id === userReserve.reserve.id
      );
      if (!poolReserve) {
        throw new Error(
          'Reserve is not registered on platform, please contact support'
        );
      }
      const computedUserReserve = computeUserReserveData(
        poolReserve,
        userReserve,
        usdPriceBch,
        currentTimestamp,
        rewardsInfo
      );

      totalRewards = totalRewards.plus(computedUserReserve.totalRewards);
      totalRewardsBCH = totalRewardsBCH.plus(
        computedUserReserve.totalRewardsBCH
      );
      totalRewardsUSD = totalRewardsUSD.plus(
        computedUserReserve.totalRewardsUSD
      );

      totalLiquidityBCH = totalLiquidityBCH.plus(
        computedUserReserve.underlyingBalanceBCH
      );
      totalBorrowsBCH = totalBorrowsBCH
        .plus(computedUserReserve.variableBorrowsBCH)
        .plus(computedUserReserve.stableBorrowsBCH);

      // asset enabled as collateral
      if (
        poolReserve.usageAsCollateralEnabled &&
        userReserve.usageAsCollateralEnabledOnUser
      ) {
        totalCollateralBCH = totalCollateralBCH.plus(
          computedUserReserve.underlyingBalanceBCH
        );
        currentLtv = currentLtv.plus(
          valueToBigNumber(
            computedUserReserve.underlyingBalanceBCH
          ).multipliedBy(poolReserve.baseLTVasCollateral)
        );
        currentLiquidationThreshold = currentLiquidationThreshold.plus(
          valueToBigNumber(
            computedUserReserve.underlyingBalanceBCH
          ).multipliedBy(poolReserve.reserveLiquidationThreshold)
        );
      }
      return computedUserReserve;
    })
    .sort((a, b) =>
      a.reserve.symbol > b.reserve.symbol
        ? 1
        : a.reserve.symbol < b.reserve.symbol
        ? -1
        : 0
    );

  if (currentLtv.gt(0)) {
    currentLtv = currentLtv
      .div(totalCollateralBCH)
      .decimalPlaces(0, BigNumber.ROUND_DOWN);
  }
  if (currentLiquidationThreshold.gt(0)) {
    currentLiquidationThreshold = currentLiquidationThreshold
      .div(totalCollateralBCH)
      .decimalPlaces(0, BigNumber.ROUND_DOWN);
  }

  const healthFactor = calculateHealthFactorFromBalances(
    totalCollateralBCH,
    totalBorrowsBCH,
    currentLiquidationThreshold
  );

  const totalCollateralUSD = totalCollateralBCH
    .multipliedBy(pow10(USD_DECIMALS))
    .dividedBy(usdPriceBch)
    .toString();

  const totalLiquidityUSD = totalLiquidityBCH
    .multipliedBy(pow10(USD_DECIMALS))
    .dividedBy(usdPriceBch)
    .toString();

  const totalBorrowsUSD = totalBorrowsBCH
    .multipliedBy(pow10(USD_DECIMALS))
    .dividedBy(usdPriceBch)
    .toString();

  const availableBorrowsBCH = calculateavailableBorrowsBCH(
    totalCollateralBCH,
    totalBorrowsBCH,
    currentLtv
  );

  return {
    totalLiquidityUSD,
    totalCollateralUSD,
    totalBorrowsUSD,
    totalRewards: totalRewards.toString(),
    totalRewardsBCH: totalRewardsBCH.toString(),
    totalRewardsUSD: totalRewardsUSD.toString(),
    id: userId,
    totalLiquidityBCH: totalLiquidityBCH.toString(),
    totalCollateralBCH: totalCollateralBCH.toString(),
    totalBorrowsBCH: totalBorrowsBCH.toString(),
    availableBorrowsBCH: availableBorrowsBCH.toString(),
    currentLoanToValue: currentLtv.toString(),
    currentLiquidationThreshold: currentLiquidationThreshold.toString(),
    healthFactor: healthFactor.toString(),
    reservesData: userReservesData,
  };
}

export function formatUserSummaryData(
  poolReservesData: ReserveData[],
  rawUserReserves: UserReserveData[],
  userId: string,
  usdPriceBch: BigNumberValue,
  currentTimestamp: number,
  rewardsInfo: RewardsInformation
): UserSummaryData {
  const userData = computeRawUserSummaryData(
    poolReservesData,
    rawUserReserves,
    userId,
    usdPriceBch,
    currentTimestamp,
    rewardsInfo
  );
  const userReservesData = userData.reservesData.map(
    ({ reserve, ...userReserve }): ComputedUserReserve => {
      const reserveDecimals = reserve.decimals;
      return {
        ...userReserve,
        reserve: {
          ...reserve,
          reserveLiquidationBonus: normalize(
            valueToBigNumber(reserve.reserveLiquidationBonus).minus(
              pow10(LTV_PRECISION)
            ),
            4
          ),
          liquidityRate: normalize(reserve.liquidityRate, RAY_DECIMALS),
        },
        scaledATokenBalance: normalize(
          userReserve.scaledATokenBalance,
          reserveDecimals
        ),
        stableBorrowRate: normalize(userReserve.stableBorrowRate, RAY_DECIMALS),
        variableBorrowIndex: normalize(
          userReserve.variableBorrowIndex,
          RAY_DECIMALS
        ),
        underlyingBalance: normalize(
          userReserve.underlyingBalance,
          reserveDecimals
        ),
        underlyingBalanceBCH: normalize(
          userReserve.underlyingBalanceBCH,
          BCH_DECIMALS
        ),
        underlyingBalanceUSD: normalize(
          userReserve.underlyingBalanceUSD,
          USD_DECIMALS
        ),
        stableBorrows: normalize(userReserve.stableBorrows, reserveDecimals),
        stableBorrowsBCH: normalize(userReserve.stableBorrowsBCH, BCH_DECIMALS),
        stableBorrowsUSD: normalize(userReserve.stableBorrowsUSD, USD_DECIMALS),
        variableBorrows: normalize(
          userReserve.variableBorrows,
          reserveDecimals
        ),
        variableBorrowsBCH: normalize(
          userReserve.variableBorrowsBCH,
          BCH_DECIMALS
        ),
        variableBorrowsUSD: normalize(
          userReserve.variableBorrowsUSD,
          USD_DECIMALS
        ),
        totalBorrows: normalize(userReserve.totalBorrows, reserveDecimals),
        totalBorrowsBCH: normalize(userReserve.totalBorrowsBCH, BCH_DECIMALS),
        totalBorrowsUSD: normalize(userReserve.totalBorrowsUSD, USD_DECIMALS),
      };
    }
  );
  return {
    id: userData.id,
    reservesData: userReservesData,
    totalLiquidityBCH: normalize(userData.totalLiquidityBCH, BCH_DECIMALS),
    totalLiquidityUSD: normalize(userData.totalLiquidityUSD, USD_DECIMALS),
    totalCollateralBCH: normalize(userData.totalCollateralBCH, BCH_DECIMALS),
    totalCollateralUSD: normalize(userData.totalCollateralUSD, USD_DECIMALS),
    totalBorrowsBCH: normalize(userData.totalBorrowsBCH, BCH_DECIMALS),
    totalBorrowsUSD: normalize(userData.totalBorrowsUSD, USD_DECIMALS),
    availableBorrowsBCH: normalize(userData.availableBorrowsBCH, BCH_DECIMALS),
    currentLoanToValue: normalize(userData.currentLoanToValue, 4),
    currentLiquidationThreshold: normalize(
      userData.currentLiquidationThreshold,
      4
    ),
    healthFactor: userData.healthFactor,
    totalRewards: userData.totalRewards,
    totalRewardsBCH: userData.totalRewardsBCH,
    totalRewardsUSD: userData.totalRewardsUSD,
  };
}

/**
 * Calculates the formatted debt accrued to a given point in time.
 * @param reserve
 * @param currentTimestamp unix timestamp which must be higher than reserve.lastUpdateTimestamp
 */
export function calculateReserveDebt(
  reserve: ReserveData,
  currentTimestamp: number
) {
  const totalVariableDebt = normalize(
    rayMul(
      rayMul(reserve.totalScaledVariableDebt, reserve.variableBorrowIndex),
      calculateCompoundedInterest(
        reserve.variableBorrowRate,
        currentTimestamp,
        reserve.lastUpdateTimestamp
      )
    ),
    reserve.decimals
  );
  const totalStableDebt = normalize(
    rayMul(
      reserve.totalPrincipalStableDebt,
      calculateCompoundedInterest(
        reserve.averageStableRate,
        currentTimestamp,
        reserve.stableDebtLastUpdateTimestamp
      )
    ),
    reserve.decimals
  );
  return { totalVariableDebt, totalStableDebt };
}

export function formatReserves(
  reserves: ReserveData[],
  currentTimestamp?: number,
  reserveIndexes30DaysAgo?: ReserveRatesData[],
  rewardTokenPriceBch = '0',
  emissionEndTimestamp?: number
): ComputedReserveData[] {
  return reserves.map((reserve) => {
    const reserve30DaysAgo = reserveIndexes30DaysAgo?.find(
      (res) => res.id === reserve.id
    )?.paramsHistory?.[0];

    const availableLiquidity = normalize(
      reserve.availableLiquidity,
      reserve.decimals
    );

    const { totalVariableDebt, totalStableDebt } = calculateReserveDebt(
      reserve,
      currentTimestamp || reserve.lastUpdateTimestamp
    );

    const totalDebt = valueToBigNumber(totalStableDebt).plus(totalVariableDebt);

    const totalLiquidity = totalDebt.plus(availableLiquidity).toString();
    const utilizationRate =
      totalLiquidity !== '0'
        ? totalDebt.dividedBy(totalLiquidity).toString()
        : '0';

    const hasEmission =
      emissionEndTimestamp &&
      emissionEndTimestamp >
        (currentTimestamp || Math.floor(Date.now() / 1000));

    const aIncentivesAPY =
      hasEmission && totalLiquidity !== '0'
        ? calculateIncentivesAPY(
            reserve.aEmissionPerSecond,
            rewardTokenPriceBch,
            totalLiquidity,
            reserve.price.priceInBch
          )
        : '0';

    const vIncentivesAPY =
      hasEmission && totalVariableDebt !== '0'
        ? calculateIncentivesAPY(
            reserve.vEmissionPerSecond,
            rewardTokenPriceBch,
            totalVariableDebt,
            reserve.price.priceInBch
          )
        : '0';

    const sIncentivesAPY =
      hasEmission && totalStableDebt !== '0'
        ? calculateIncentivesAPY(
            reserve.sEmissionPerSecond,
            rewardTokenPriceBch,
            totalStableDebt,
            reserve.price.priceInBch
          )
        : '0';

    return {
      ...reserve,
      totalVariableDebt,
      totalStableDebt,
      totalLiquidity,
      availableLiquidity,
      utilizationRate,
      aIncentivesAPY,
      vIncentivesAPY,
      sIncentivesAPY,
      totalDebt: totalDebt.toString(),
      price: {
        ...reserve.price,
        priceInBch: normalize(reserve.price.priceInBch, BCH_DECIMALS),
      },
      baseLTVasCollateral: normalize(
        reserve.baseLTVasCollateral,
        LTV_PRECISION
      ),
      reserveFactor: normalize(reserve.reserveFactor, LTV_PRECISION),
      variableBorrowRate: normalize(reserve.variableBorrowRate, RAY_DECIMALS),
      avg30DaysVariableBorrowRate: reserve30DaysAgo
        ? calculateAverageRate(
            reserve30DaysAgo.variableBorrowIndex,
            reserve.variableBorrowIndex,
            reserve30DaysAgo.timestamp,
            reserve.lastUpdateTimestamp
          )
        : undefined,
      avg30DaysLiquidityRate: reserve30DaysAgo
        ? calculateAverageRate(
            reserve30DaysAgo.liquidityIndex,
            reserve.liquidityIndex,
            reserve30DaysAgo.timestamp,
            reserve.lastUpdateTimestamp
          )
        : undefined,

      stableBorrowRate: normalize(reserve.stableBorrowRate, RAY_DECIMALS),
      liquidityRate: normalize(reserve.liquidityRate, RAY_DECIMALS),
      liquidityIndex: normalize(reserve.liquidityIndex, RAY_DECIMALS),
      reserveLiquidationThreshold: normalize(
        reserve.reserveLiquidationThreshold,
        4
      ),
      reserveLiquidationBonus: normalize(
        valueToBigNumber(reserve.reserveLiquidationBonus).minus(
          10 ** LTV_PRECISION
        ),
        4
      ),
      totalScaledVariableDebt: normalize(
        reserve.totalScaledVariableDebt,
        reserve.decimals
      ),
      totalPrincipalStableDebt: normalize(
        reserve.totalPrincipalStableDebt,
        reserve.decimals
      ),
      variableBorrowIndex: normalize(reserve.variableBorrowIndex, RAY_DECIMALS),
    };
  });
}

/**
 * Calculates the debt accrued to a given point in time.
 * @param reserve
 * @param currentTimestamp unix timestamp which must be higher than reserve.lastUpdateTimestamp
 */
export function calculateReserveDebtSuppliesRaw(
  reserve: ReserveSupplyData,
  currentTimestamp: number
) {
  const totalVariableDebt = rayMul(
    rayMul(reserve.totalScaledVariableDebt, reserve.variableBorrowIndex),
    calculateCompoundedInterest(
      reserve.variableBorrowRate,
      currentTimestamp,
      reserve.lastUpdateTimestamp
    )
  );
  const totalStableDebt = rayMul(
    reserve.totalPrincipalStableDebt,
    calculateCompoundedInterest(
      reserve.averageStableRate,
      currentTimestamp,
      reserve.stableDebtLastUpdateTimestamp
    )
  );
  return { totalVariableDebt, totalStableDebt };
}

export function calculateSupplies(
  reserve: ReserveSupplyData,
  currentTimestamp: number
): Supplies {
  const {
    totalVariableDebt,
    totalStableDebt,
  } = calculateReserveDebtSuppliesRaw(reserve, currentTimestamp);

  const totalDebt = totalVariableDebt.plus(totalStableDebt);

  const totalLiquidity = totalDebt.plus(reserve.availableLiquidity);
  return {
    totalVariableDebt,
    totalStableDebt,
    totalLiquidity,
  };
}

export function calculateIncentivesAPY(
  emissionPerSecond: string,
  rewardTokenpriceInBch: string,
  tokenTotalSupplyNormalized: string,
  tokenpriceInBch: string
): string {
  const emissionPerSecondNormalized = normalizeBN(
    emissionPerSecond,
    BCH_DECIMALS
  ).multipliedBy(rewardTokenpriceInBch);
  const emissionPerYear = emissionPerSecondNormalized.multipliedBy(
    SECONDS_PER_YEAR
  );

  const totalSupplyNormalized = valueToBigNumber(
    tokenTotalSupplyNormalized
  ).multipliedBy(tokenpriceInBch);

  return emissionPerYear.dividedBy(totalSupplyNormalized).toString(10);
}

export function calculateRewards(
  principalUserBalance: string,
  reserveIndex: string,
  userIndex: string,
  precision: number,
  rewardTokenDecimals: number,
  reserveIndexTimestamp: number,
  emissionPerSecond: string,
  totalSupply: BigNumber,
  currentTimestamp: number,
  emissionEndTimestamp: number
): string {
  const actualCurrentTimestamp =
    currentTimestamp > emissionEndTimestamp
      ? emissionEndTimestamp
      : currentTimestamp;

  const timeDelta = actualCurrentTimestamp - reserveIndexTimestamp;

  let currentReserveIndex;
  if (
    reserveIndexTimestamp == +currentTimestamp ||
    reserveIndexTimestamp >= emissionEndTimestamp
  ) {
    currentReserveIndex = valueToZDBigNumber(reserveIndex);
  } else {
    currentReserveIndex = valueToZDBigNumber(emissionPerSecond)
      .multipliedBy(timeDelta)
      .multipliedBy(pow10(precision))
      .dividedBy(totalSupply)
      .plus(reserveIndex);
  }

  const reward = valueToZDBigNumber(principalUserBalance)
    .multipliedBy(currentReserveIndex.minus(userIndex))
    .dividedBy(pow10(precision));

  return normalize(reward, rewardTokenDecimals);
}
