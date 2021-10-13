// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.6.8;

interface IWBCHGateway {
    function depositBCH(
    address lendingPool,
    address onBehalfOf,
    uint16 referralCode
  ) external payable;

  function withdrawBCH(
    address lendingPool,
    uint256 amount,
    address onBehalfOf
  ) external;

  function repayBCH(
    address lendingPool,
    uint256 amount,
    uint256 rateMode,
    address onBehalfOf
  ) external payable;

  function borrowBCH(
    address lendingPool,
    uint256 amount,
    uint256 interesRateMode,
    uint16 referralCode
  ) external;
}
