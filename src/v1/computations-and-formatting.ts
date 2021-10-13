import BigNumber from 'bignumber.js';
import * as RayMath from '../helpers/ray-math';
import {
  ReserveData,
  ComputedUserReserve,
  UserReserveData,
  UserSummaryData,
  BorrowRateMode,
  ReserveRatesData,
} from './types';
import {
  BigNumberValue,
  valueToBigNumber,
  valueToZDBigNumber,
  normalize,
  pow10,
} from '../helpers/bignumber';
import {
  BCH_DECIMALS,
  RAY_DECIMALS,
  SECONDS_PER_YEAR,
  USD_DECIMALS,
} from '../helpers/constants';
import {
  calculateAverageRate,
  getReserveNormalizedIncome,
} from '../helpers/pool-math';

export type GetCompoundedBorrowBalanceParamsReserve = Pick<
  ReserveData,
  'variableBorrowRate' | 'lastUpdateTimestamp' | 'variableBorrowIndex'
>;
export type GetCompoundedBorrowBalanceParamsUserReserve = Pick<
  UserReserveData,
  | 'principalBorrows'
  | 'borrowRateMode'
  | 'variableBorrowIndex'
  | 'borrowRate'
  | 'lastUpdateTimestamp'
>;

export function getCompoundedBorrowBalance(
  reserve: GetCompoundedBorrowBalanceParamsReserve,
  userReserve: GetCompoundedBorrowBalanceParamsUserReserve,
  currentTimestamp: number
): BigNumber {
  const principalBorrows = valueToZDBigNumber(userReserve.principalBorrows);
  if (principalBorrows.eq('0')) {
    return valueToZDBigNumber('0');
  }

  let cumulatedInterest;
  if (userReserve.borrowRateMode === BorrowRateMode.Variable) {
    const compoundedInterest = calculateCompoundedInterest(
      reserve.variableBorrowRate,
      currentTimestamp,
      reserve.lastUpdateTimestamp
    );

    cumulatedInterest = RayMath.rayDiv(
      RayMath.rayMul(compoundedInterest, reserve.variableBorrowIndex),
      userReserve.variableBorrowIndex
    );
  } else {
    // if stable
    cumulatedInterest = calculateCompoundedInterest(
      userReserve.borrowRate,
      currentTimestamp,
      userReserve.lastUpdateTimestamp
    );
  }

  const borrowBalanceRay = RayMath.wadToRay(principalBorrows);

  return RayMath.rayToWad(RayMath.rayMul(borrowBalanceRay, cumulatedInterest));
}

export const calculateCompoundedInterest = (
  rate: BigNumberValue,
  currentTimestamp: number,
  lastUpdateTimestamp: number
): BigNumber => {
  const timeDelta = valueToZDBigNumber(currentTimestamp - lastUpdateTimestamp);
  const ratePerSecond = valueToZDBigNumber(rate).dividedBy(SECONDS_PER_YEAR);
  return RayMath.binomialApproximatedRayPow(ratePerSecond, timeDelta);
};

export function calculateHealthFactorFromBalances(
  collateralBalanceBCH: BigNumberValue,
  borrowBalanceBCH: BigNumberValue,
  totalFeesBCH: BigNumberValue,
  currentLiquidationThreshold: BigNumberValue
): BigNumber {
  if (valueToBigNumber(borrowBalanceBCH).eq(0)) {
    return valueToBigNumber('-1'); // invalid number
  }
  return valueToBigNumber(collateralBalanceBCH)
    .multipliedBy(currentLiquidationThreshold)
    .dividedBy(100)
    .div(valueToBigNumber(borrowBalanceBCH).plus(totalFeesBCH));
}

export function calculateHealthFactorFromBalancesBigUnits(
  collateralBalanceBCH: BigNumberValue,
  borrowBalanceBCH: BigNumberValue,
  totalFeesBCH: BigNumberValue,
  currentLiquidationThreshold: BigNumberValue
): BigNumber {
  return calculateHealthFactorFromBalances(
    collateralBalanceBCH,
    borrowBalanceBCH,
    totalFeesBCH,
    new BigNumber(currentLiquidationThreshold)
      .multipliedBy(100)
      .decimalPlaces(0, BigNumber.ROUND_DOWN)
  );
}

export function calculateavailableBorrowsBCH(
  collateralBalanceBCH: BigNumberValue,
  borrowBalanceBCH: BigNumberValue,
  totalFeesBCH: BigNumberValue,
  currentLtv: BigNumberValue
): BigNumber {
  if (valueToZDBigNumber(currentLtv).eq(0)) {
    return valueToZDBigNumber('0');
  }
  let availableBorrowsBCH = valueToZDBigNumber(collateralBalanceBCH)
    .multipliedBy(currentLtv)
    .dividedBy(100);
  if (availableBorrowsBCH.lt(borrowBalanceBCH)) {
    return valueToZDBigNumber('0');
  }
  availableBorrowsBCH = availableBorrowsBCH
    .minus(borrowBalanceBCH)
    .minus(totalFeesBCH);
  const borrowFee = availableBorrowsBCH.multipliedBy('0.0025');
  return availableBorrowsBCH.minus(borrowFee);
}

export type CalculateCumulatedBalancePoolReserve = {
  liquidityRate: BigNumberValue;
  liquidityIndex: BigNumberValue;
  lastUpdateTimestamp: number;
};
export type CalculateCumulatedBalanceUserReserve = Pick<
  UserReserveData,
  'userBalanceIndex'
>;

export function calculateCumulatedBalance(
  balance: BigNumberValue,
  userReserve: CalculateCumulatedBalanceUserReserve,
  poolReserve: CalculateCumulatedBalancePoolReserve,
  currentTimestamp: number
): BigNumber {
  return RayMath.rayToWad(
    RayMath.rayDiv(
      RayMath.rayMul(
        RayMath.wadToRay(balance),
        getReserveNormalizedIncome(
          poolReserve.liquidityRate,
          poolReserve.liquidityIndex,
          poolReserve.lastUpdateTimestamp,
          currentTimestamp
        )
      ),
      userReserve.userBalanceIndex
    )
  );
}

export type CalculateCurrentUnderlyingBalancePoolReserve = CalculateCumulatedBalancePoolReserve;
export type CalculateCurrentUnderlyingBalanceUserReserve = CalculateCumulatedBalanceUserReserve &
  Pick<
    UserReserveData,
    | 'principalATokenBalance'
    | 'redirectedBalance'
    | 'interestRedirectionAddress'
  >;

export function calculateCurrentUnderlyingBalance(
  userReserve: CalculateCurrentUnderlyingBalanceUserReserve,
  poolReserve: CalculateCurrentUnderlyingBalancePoolReserve,
  currentTimestamp: number
): BigNumber {
  if (
    userReserve.principalATokenBalance === '0' &&
    userReserve.redirectedBalance === '0'
  ) {
    return valueToZDBigNumber('0');
  }
  if (
    userReserve.interestRedirectionAddress !==
    '0x0000000000000000000000000000000000000000'
  ) {
    return valueToZDBigNumber(userReserve.principalATokenBalance).plus(
      calculateCumulatedBalance(
        userReserve.redirectedBalance,
        userReserve,
        poolReserve,
        currentTimestamp
      ).minus(userReserve.redirectedBalance)
    );
  }
  return calculateCumulatedBalance(
    valueToBigNumber(userReserve.redirectedBalance)
      .plus(userReserve.principalATokenBalance)
      .toString(),
    userReserve,
    poolReserve,
    currentTimestamp
  ).minus(userReserve.redirectedBalance);
}

function computeUserReserveData(
  poolReserve: ReserveData,
  userReserve: UserReserveData,
  usdPriceBch: BigNumberValue,
  currentTimestamp: number
): ComputedUserReserve {
  const {
    price: { priceInBch },
    decimals,
  } = poolReserve;
  const currentUnderlyingBalance = calculateCurrentUnderlyingBalance(
    userReserve,
    poolReserve,
    currentTimestamp
  );
  const currentunderlyingBalanceBCH = currentUnderlyingBalance
    .multipliedBy(priceInBch)
    .dividedBy(pow10(decimals));
  const currentUnderlyingBalanceUSD = currentunderlyingBalanceBCH
    .multipliedBy(pow10(USD_DECIMALS))
    .dividedBy(usdPriceBch)
    .toFixed(0);

  const principalBorrowsBCH = valueToZDBigNumber(userReserve.principalBorrows)
    .multipliedBy(priceInBch)
    .dividedBy(pow10(decimals));
  const principalBorrowsUSD = principalBorrowsBCH
    .multipliedBy(pow10(USD_DECIMALS))
    .dividedBy(usdPriceBch)
    .toFixed(0);

  const currentBorrows = getCompoundedBorrowBalance(
    poolReserve,
    userReserve,
    currentTimestamp
  );
  const currentBorrowsBCH = currentBorrows
    .multipliedBy(priceInBch)
    .dividedBy(pow10(decimals));
  const currentBorrowsUSD = currentBorrowsBCH
    .multipliedBy(pow10(USD_DECIMALS))
    .dividedBy(usdPriceBch)
    .toFixed(0);

  const originationFeeBCH = valueToZDBigNumber(userReserve.originationFee)
    .multipliedBy(priceInBch)
    .dividedBy(pow10(decimals));
  const originationFeeUSD = originationFeeBCH
    .multipliedBy(pow10(USD_DECIMALS))
    .dividedBy(usdPriceBch)
    .toFixed(0);

  return {
    ...userReserve,
    principalBorrowsUSD,
    currentBorrowsUSD,
    originationFeeUSD,
    currentUnderlyingBalanceUSD,
    originationFeeBCH: originationFeeBCH.toString(),
    currentBorrows: currentBorrows.toString(),
    currentBorrowsBCH: currentBorrowsBCH.toString(),
    principalBorrowsBCH: principalBorrowsBCH.toString(),
    currentUnderlyingBalance: currentUnderlyingBalance.toFixed(),
    currentunderlyingBalanceBCH: currentunderlyingBalanceBCH.toFixed(),
  };
}

export function computeRawUserSummaryData(
  poolReservesData: ReserveData[],
  rawUserReserves: UserReserveData[],
  userId: string,
  usdPriceBch: BigNumberValue,
  currentTimestamp: number
): UserSummaryData {
  let totalLiquidityBCH = valueToZDBigNumber('0');
  let totalCollateralBCH = valueToZDBigNumber('0');
  let totalBorrowsBCH = valueToZDBigNumber('0');
  let totalFeesBCH = valueToZDBigNumber('0');
  let currentLtv = valueToBigNumber('0');
  let currentLiquidationThreshold = valueToBigNumber('0');

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
        currentTimestamp
      );
      totalLiquidityBCH = totalLiquidityBCH.plus(
        computedUserReserve.currentunderlyingBalanceBCH
      );
      totalBorrowsBCH = totalBorrowsBCH.plus(
        computedUserReserve.currentBorrowsBCH
      );
      totalFeesBCH = totalFeesBCH.plus(computedUserReserve.originationFeeBCH);

      // asset enabled as collateral
      if (
        poolReserve.usageAsCollateralEnabled &&
        userReserve.usageAsCollateralEnabledOnUser
      ) {
        totalCollateralBCH = totalCollateralBCH.plus(
          computedUserReserve.currentunderlyingBalanceBCH
        );
        currentLtv = currentLtv.plus(
          valueToBigNumber(
            computedUserReserve.currentunderlyingBalanceBCH
          ).multipliedBy(poolReserve.baseLTVasCollateral)
        );
        currentLiquidationThreshold = currentLiquidationThreshold.plus(
          valueToBigNumber(
            computedUserReserve.currentunderlyingBalanceBCH
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
    totalFeesBCH,
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

  const totalFeesUSD = totalFeesBCH
    .multipliedBy(pow10(USD_DECIMALS))
    .dividedBy(usdPriceBch);

  const totalBorrowsWithFeesBCH = totalFeesBCH.plus(totalBorrowsBCH);
  const totalBorrowsWithFeesUSD = totalFeesUSD.plus(totalBorrowsUSD);
  const availableBorrowsBCH = calculateavailableBorrowsBCH(
    totalCollateralBCH,
    totalBorrowsBCH,
    totalFeesBCH,
    currentLtv
  );

  const totalBorrowsAndFeesETH = totalBorrowsBCH.plus(totalFeesBCH);
  const maxAmountToWithdrawInBch = totalLiquidityBCH.minus(
    totalBorrowsAndFeesETH.eq(0)
      ? '0'
      : totalBorrowsAndFeesETH
          .multipliedBy(100)
          .dividedBy(currentLiquidationThreshold)
  );

  return {
    totalLiquidityUSD,
    totalCollateralUSD,
    totalBorrowsUSD,
    id: userId,
    totalLiquidityBCH: totalLiquidityBCH.toString(),
    totalCollateralBCH: totalCollateralBCH.toString(),
    totalFeesBCH: totalFeesBCH.toString(),
    totalBorrowsBCH: totalBorrowsBCH.toString(),
    availableBorrowsBCH: availableBorrowsBCH.toString(),
    currentLoanToValue: currentLtv.toString(),
    currentLiquidationThreshold: currentLiquidationThreshold.toString(),
    maxAmountToWithdrawInBch: maxAmountToWithdrawInBch.toString(),
    healthFactor: healthFactor.toString(),
    reservesData: userReservesData,
    totalFeesUSD: totalFeesUSD.toString(),
    totalBorrowsWithFeesBCH: totalBorrowsWithFeesBCH.toString(),
    totalBorrowsWithFeesUSD: totalBorrowsWithFeesUSD.toString(),
  };
}

export function formatUserSummaryData(
  poolReservesData: ReserveData[],
  rawUserReserves: UserReserveData[],
  userId: string,
  usdPriceBch: BigNumberValue,
  currentTimestamp: number
): UserSummaryData {
  const userData = computeRawUserSummaryData(
    poolReservesData,
    rawUserReserves,
    userId,
    usdPriceBch,
    currentTimestamp
  );
  const userReservesData = userData.reservesData.map(
    ({ reserve, ...userReserve }): ComputedUserReserve => {
      const reserveDecimals = reserve.decimals;
      return {
        ...userReserve,
        reserve: {
          ...reserve,
          reserveLiquidationBonus: normalize(
            valueToBigNumber(reserve.reserveLiquidationBonus).minus(100),
            2
          ),
          liquidityRate: normalize(reserve.liquidityRate, RAY_DECIMALS),
        },
        redirectedBalance: normalize(
          userReserve.redirectedBalance,
          reserveDecimals
        ),
        principalATokenBalance: normalize(
          userReserve.principalATokenBalance,
          reserveDecimals
        ),
        borrowRate: normalize(userReserve.borrowRate, RAY_DECIMALS),
        lastUpdateTimestamp: userReserve.lastUpdateTimestamp,
        variableBorrowIndex: normalize(
          userReserve.variableBorrowIndex,
          RAY_DECIMALS
        ),
        userBalanceIndex: normalize(userReserve.userBalanceIndex, RAY_DECIMALS),
        currentUnderlyingBalance: normalize(
          userReserve.currentUnderlyingBalance,
          reserveDecimals
        ),
        currentunderlyingBalanceBCH: normalize(
          userReserve.currentunderlyingBalanceBCH,
          BCH_DECIMALS
        ),
        currentUnderlyingBalanceUSD: normalize(
          userReserve.currentUnderlyingBalanceUSD,
          USD_DECIMALS
        ),
        principalBorrows: normalize(
          userReserve.principalBorrows,
          reserveDecimals
        ),
        principalBorrowsBCH: normalize(
          userReserve.principalBorrowsBCH,
          BCH_DECIMALS
        ),
        principalBorrowsUSD: normalize(
          userReserve.principalBorrowsUSD,
          USD_DECIMALS
        ),
        currentBorrows: normalize(userReserve.currentBorrows, reserveDecimals),
        currentBorrowsBCH: normalize(
          userReserve.currentBorrowsBCH,
          BCH_DECIMALS
        ),
        currentBorrowsUSD: normalize(
          userReserve.currentBorrowsUSD,
          USD_DECIMALS
        ),
        originationFee: normalize(userReserve.originationFee, reserveDecimals),
        originationFeeBCH: normalize(
          userReserve.originationFeeBCH,
          BCH_DECIMALS
        ),
        originationFeeUSD: normalize(
          userReserve.originationFeeUSD,
          USD_DECIMALS
        ),
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
    totalFeesBCH: normalize(userData.totalFeesBCH, BCH_DECIMALS),
    totalFeesUSD: normalize(userData.totalFeesUSD, USD_DECIMALS),
    totalBorrowsBCH: normalize(userData.totalBorrowsBCH, BCH_DECIMALS),
    totalBorrowsUSD: normalize(userData.totalBorrowsUSD, USD_DECIMALS),
    totalBorrowsWithFeesBCH: normalize(
      userData.totalBorrowsWithFeesBCH,
      BCH_DECIMALS
    ),
    totalBorrowsWithFeesUSD: normalize(
      userData.totalBorrowsWithFeesUSD,
      USD_DECIMALS
    ),
    availableBorrowsBCH: normalize(userData.availableBorrowsBCH, BCH_DECIMALS),
    currentLoanToValue: normalize(userData.currentLoanToValue, 2),
    currentLiquidationThreshold: normalize(
      userData.currentLiquidationThreshold,
      2
    ),
    maxAmountToWithdrawInBch: normalize(
      userData.maxAmountToWithdrawInBch,
      BCH_DECIMALS
    ),
    healthFactor: userData.healthFactor,
  };
}

export function formatReserves(
  reserves: ReserveData[],
  reserveIndexes30DaysAgo?: ReserveRatesData[]
): ReserveData[] {
  return reserves.map((reserve) => {
    const reserve30DaysAgo = reserveIndexes30DaysAgo?.find(
      (res) => res.id === reserve.id
    )?.paramsHistory?.[0];

    return {
      ...reserve,
      price: {
        ...reserve.price,
        priceInBch: normalize(reserve.price.priceInBch, BCH_DECIMALS),
      },
      baseLTVasCollateral: normalize(reserve.baseLTVasCollateral, 2),
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
      totalLiquidity: normalize(reserve.totalLiquidity, reserve.decimals),
      availableLiquidity: normalize(
        reserve.availableLiquidity,
        reserve.decimals
      ),
      liquidityIndex: normalize(reserve.liquidityIndex, RAY_DECIMALS),
      reserveLiquidationThreshold: normalize(
        reserve.reserveLiquidationThreshold,
        2
      ),
      reserveLiquidationBonus: normalize(
        valueToBigNumber(reserve.reserveLiquidationBonus).minus(100),
        2
      ),
      totalBorrows: normalize(reserve.totalBorrows, reserve.decimals),
      totalBorrowsVariable: normalize(
        reserve.totalBorrowsVariable,
        reserve.decimals
      ),
      totalBorrowsStable: normalize(
        reserve.totalBorrowsStable,
        reserve.decimals
      ),
      variableBorrowIndex: normalize(reserve.variableBorrowIndex, RAY_DECIMALS),
    };
  });
}

export function calculateInterestRates(
  reserve: ReserveData,
  amountToDeposit: BigNumberValue,
  amountToBorrow: BigNumberValue,
  borrowMode: 'stable' | 'variable' = 'variable'
) {
  const { optimalUtilisationRate } = reserve;
  const baseVariableBorrowRate = valueToBigNumber(
    reserve.baseVariableBorrowRate
  );
  const totalBorrowsStable = valueToBigNumber(reserve.totalBorrowsStable).plus(
    borrowMode === 'stable' ? amountToBorrow : '0'
  );
  const totalBorrowsVariable = valueToBigNumber(
    reserve.totalBorrowsVariable
  ).plus(borrowMode === 'variable' ? amountToBorrow : '0');
  const totalBorrows = totalBorrowsStable.plus(totalBorrowsVariable);
  const totalDeposits = valueToBigNumber(reserve.totalLiquidity).plus(
    amountToDeposit
  );
  const utilizationRate =
    totalDeposits.eq(0) && totalBorrows.eq(0)
      ? valueToBigNumber(0)
      : totalBorrows.dividedBy(totalDeposits);

  let currentStableBorrowRate = valueToBigNumber(reserve.stableBorrowRate);
  let currentVariableBorrowRate = valueToBigNumber(0);
  let currentLiquidityRate = valueToBigNumber(0);

  if (utilizationRate.gt(optimalUtilisationRate)) {
    const excessUtilizationRateRatio = utilizationRate
      .minus(optimalUtilisationRate)
      .dividedBy(valueToBigNumber(1).minus(optimalUtilisationRate));

    currentStableBorrowRate = currentStableBorrowRate
      .plus(reserve.stableRateSlope1)
      .plus(excessUtilizationRateRatio.multipliedBy(reserve.stableRateSlope2));
    currentVariableBorrowRate = baseVariableBorrowRate
      .plus(reserve.variableRateSlope1)
      .plus(
        excessUtilizationRateRatio.multipliedBy(reserve.variableRateSlope2)
      );
  } else {
    currentStableBorrowRate = currentVariableBorrowRate.plus(
      utilizationRate
        .dividedBy(optimalUtilisationRate)
        .multipliedBy(reserve.stableRateSlope1)
    );
    currentVariableBorrowRate = baseVariableBorrowRate.plus(
      utilizationRate
        .dividedBy(optimalUtilisationRate)
        .multipliedBy(reserve.variableRateSlope1)
    );
  }

  if (!totalBorrows.eq(0)) {
    const weightedVariableRate = currentVariableBorrowRate.multipliedBy(
      totalBorrowsVariable
    );
    const weightedStableRate = valueToBigNumber(
      reserve.averageStableBorrowRate
    ).multipliedBy(totalBorrowsStable);

    currentLiquidityRate = weightedVariableRate
      .plus(weightedStableRate)
      .dividedBy(totalBorrows);
  }

  return {
    variableBorrowRate: currentVariableBorrowRate.toString(),
    stableBorrowRate: currentStableBorrowRate.toString(),
    liquidityRate: currentLiquidityRate.toString(),
  };
}
