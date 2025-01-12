// import BigNumber from 'bignumber.js';
import { formatUserSummaryData } from '../../v2';

describe('calculateUserReserveIncentives', () => {
  /*const reserveIncentiveData = {
    underlyingAsset: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    aIncentiveData: {
      emissionPerSecond: new BigNumber(1979166666666666),
      incentivesLastUpdateTimestamp: new BigNumber(1631587511),
      tokenIncentivesIndex: new BigNumber(24733519699535219),
      emissionEndTimestamp: new BigNumber(1637573428),
      tokenAddress: '0x030ba81f1c18d280636f32af80b9aad02cf0854e',
      rewardTokenAddress: '0x0000000000000000000000000000000000000000',
    },
    vIncentiveData: {
      emissionPerSecond: new BigNumber(104166666666666),
      incentivesLastUpdateTimestamp: new BigNumber(1631587387),
      tokenIncentivesIndex: new BigNumber(26465727412280876),
      emissionEndTimestamp: new BigNumber(1637573428),
      tokenAddress: '0xf63b34710400cad3e044cffdcab00a0f32e33ecf',
      rewardTokenAddress: '0x0000000000000000000000000000000000000000',
    },
    sIncentiveData: {
      emissionPerSecond: new BigNumber(0),
      incentivesLastUpdateTimestamp: new BigNumber(0),
      tokenIncentivesIndex: new BigNumber(0),
      emissionEndTimestamp: new BigNumber(1637573428),
      tokenAddress: '0x4e977830ba4bd783c0bb7f15d3e243f73ff57121',
      rewardTokenAddress: '0x0000000000000000000000000000000000000000',
    },
  };
  const userReserveIncentiveData = {
    underlyingAsset: '0x030ba81f1c18d280636f32af80b9aad02cf0854e',
    aIncentiveData: {
      tokenIncentivesUserIndex: new BigNumber(0),
      userUnclaimedRewards: new BigNumber(43921819137644870),
      tokenAddress: '0x0000000000000000000000000000000000000000',
      rewardTokenAddress: '0x0000000000000000000000000000000000000000',
    },
    vIncentiveData: {
      tokenIncentivesUserIndex: new BigNumber(24934844000963410),
      userUnclaimedRewards: new BigNumber(43921819137644870),
      tokenAddress: '0x0000000000000000000000000000000000000000',
      rewardTokenAddress: '0x0000000000000000000000000000000000000000',
    },
    sIncentiveData: {
      tokenIncentivesUserIndex: new BigNumber(0),
      userUnclaimedRewards: new BigNumber(43921819137644870),
      tokenAddress: '0x0000000000000000000000000000000000000000',
      rewardTokenAddress: '0x0000000000000000000000000000000000000000',
    },
  };*/
  const reserveData = {
    id:
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc20xb53c1a33016b2dc2ff3653530bff1848a515c8c5',
    underlyingAsset: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    symbol: 'aWBCH',
    decimals: 18,
    baseLTVasCollateral: '8000',
    reserveLiquidationThreshold: '8500',
    reserveLiquidationBonus: '10500',
    reserveFactor: '1000',
    usageAsCollateralEnabled: true,
    borrowingEnabled: true,
    stableBorrowRateEnabled: true,
    isActive: true,
    liquidityIndex: '1007431539067282236768346040',
    variableBorrowIndex: '1009130500436609696185241835',
    liquidityRate: '222438954027153387451224',
    variableBorrowRate: '5352853290785089356838046',
    stableBorrowRate: '36691066613481361696047558',
    lastUpdateTimestamp: 1631587511,
    aTokenAddress: '0x030ba81f1c18d280636f32af80b9aad02cf0854e',
    stableDebtTokenAddress: '0x4e977830ba4bd783c0bb7f15d3e243f73ff57121',
    variableDebtTokenAddress: '0xf63b34710400cad3e044cffdcab00a0f32e33ecf',
    interestRateStrategyAddress: '0x4ce076b9dd956196b814e54e1714338f18fde3f4',
    availableLiquidity: '1827977661703998535260749',
    totalPrincipalStableDebt: '681322787738991248642',
    averageStableRate: '45598025477532527825795055',
    stableDebtLastUpdateTimestamp: 1631554490,
    totalScaledVariableDebt: '81689984341288838884434',

    price: { priceInBch: '1000000000000000000' },
    priceInBch: '1000000000000000000',
    variableRateSlope1: '80000000000000000000000000',
    variableRateSlope2: '1000000000000000000000000000',
    stableRateSlope1: '100000000000000000000000000',
    stableRateSlope2: '1000000000000000000000000000',
    aEmissionPerSecond: '1979166666666666',
    vEmissionPerSecond: '104166666666666',
    sEmissionPerSecond: '0',
    aIncentivesLastUpdateTimestamp: 1631587511,
    vIncentivesLastUpdateTimestamp: 1631587387,
    sIncentivesLastUpdateTimestamp: 0,
    aTokenIncentivesIndex: '24733519699535219',
    vTokenIncentivesIndex: '26465727412280876',
    sTokenIncentivesIndex: '0',
  };
  const rawUserReserve = {
    userReserve: {
      scaledATokenBalance: '99353924118371338',
      usageAsCollateralEnabledOnUser: true,
      scaledVariableDebt: '0',
      variableBorrowIndex: '0',
      stableBorrowRate: '0',
      principalStableDebt: '0',
      stableBorrowLastUpdateTimestamp: 0,
      aTokenincentivesUserIndex: '0',
      vTokenincentivesUserIndex: '24934844000963410',
      sTokenincentivesUserIndex: '0',
      reserve: {
        id:
          '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc20xb53c1a33016b2dc2ff3653530bff1848a515c8c5',
        symbol: 'BCH',
        decimals: 18,
        liquidityRate: '222438954027153387451224',
        reserveLiquidationBonus: '10500',
        lastUpdateTimestamp: 1631587511,
        price: {
          priceInBch: '1000000000000000000',
        },
        reserveFactor: '1000',
        baseLTVasCollateral: '8000',
        averageStableRate: '45598025477532527825795055',
        stableDebtLastUpdateTimestamp: 1631554490,
        liquidityIndex: '1007431539067282236768346040',
        reserveLiquidationThreshold: '8250',
        variableBorrowIndex: '1009130500436609696185241835',
        variableBorrowRate: '5352853290785089356838046',
        availableLiquidity: '1827977661703998535260749',
        stableBorrowRate: '37172994479933736354050909',
        totalPrincipalStableDebt: '681322787738991248642',
        totalScaledVariableDebt: '81689984341288838884434',
        usageAsCollateralEnabled: true,
      },
    },
    currentTimestamp: 1631587561,
    usdPriceBch: 329302000000,
  };

  const formattedUserReserve = formatUserSummaryData(
    [reserveData as any],
    [rawUserReserve.userReserve as any],
    '0x0',
    '0',
    1631587561,
    {
      emissionEndTimestamp: 1637573428,
      rewardTokenAddress: '0x030ba81f1c18d280636f32af80b9aad02cf0854e',
      incentivePrecision: 18,
      rewardTokenDecimals: 18,
      rewardTokenPriceBch: '11',
    }
  );

  it('should calculate the correct aWBCH incentives', () => {
    expect(formattedUserReserve.totalRewards).toBe('0.002457377422282363');
  });
});
