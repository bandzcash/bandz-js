/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { utils } from 'ethers';
import { canBeEnsAddress } from '../utils/parsings';
// import 'reflect-metadata';
import {
  is0OrPositiveMetadataKey,
  IsBchAddressArrayMetadataKey,
  IsBchAddressMetadataKey,
  IsBchAddressOrENSMetadataKey,
  isPositiveMetadataKey,
  isPositiveOrMinusOneMetadataKey,
  optionalMetadataKey,
  paramsType,
} from './paramValidators';

export function optionalValidator(
  target: any,
  propertyName: string,
  methodArguments: any
): boolean[] {
  const optionalParameters = Reflect.getOwnMetadata(
    optionalMetadataKey,
    target,
    propertyName
  );

  const isParamOptional: boolean[] = [];
  if (optionalParameters) {
    optionalParameters.forEach((parameterIndex: number) => {
      if (methodArguments[parameterIndex] == null) {
        isParamOptional[parameterIndex] = true;
      }
    });
  }
  return isParamOptional;
}

export function IsBchAddressValidator(
  target: any,
  propertyName: string,
  methodArguments: any,
  isParamOptional?: boolean[]
): void {
  const addressParameters: paramsType[] = Reflect.getOwnMetadata(
    IsBchAddressMetadataKey,
    target,
    propertyName
  );

  if (addressParameters) {
    addressParameters.forEach((storedParams) => {
      if (storedParams.field) {
        if (
          methodArguments[0][storedParams.field] &&
          !utils.isAddress(methodArguments[0][storedParams.field])
        ) {
          throw new Error(
            `Address: ${
              methodArguments[0][storedParams.field]
            } is not a valid smartBCH address`
          );
        }
      } else {
        const isOptional =
          isParamOptional && isParamOptional[storedParams.index];
        if (
          methodArguments[storedParams.index] &&
          !isOptional &&
          !utils.isAddress(methodArguments[storedParams.index])
        ) {
          throw new Error(
            `Address: ${
              methodArguments[storedParams.index]
            } is not a valid smartBCH address`
          );
        }
      }
    });
  }
}

export function IsBchAddressArrayValidator(
  target: any,
  propertyName: string,
  methodArguments: any,
  isParamOptional?: boolean[]
): void {
  const addressParameters: paramsType[] = Reflect.getOwnMetadata(
    IsBchAddressArrayMetadataKey,
    target,
    propertyName
  );

  if (addressParameters) {
    addressParameters.forEach((storedParams) => {
      if (storedParams.field) {
        if (
          methodArguments[0][storedParams.field]
          // !utils.isAddress(methodArguments[0][storedParams.field])
        ) {
          if (methodArguments[0][storedParams.field].length > 0) {
            const fieldArray = methodArguments[0][storedParams.field].split(
              ','
            );
            fieldArray.forEach((address: string) => {
              if (!utils.isAddress(address)) {
                throw new Error(
                  `Address: ${address} is not a valid smartBCH address`
                );
              }
            });
          }
        }
      } else {
        const isOptional =
          isParamOptional && isParamOptional[storedParams.index];
        if (
          methodArguments[storedParams.index] &&
          !isOptional
          // !utils.isAddress(methodArguments[storedParams.index])
        ) {
          if (methodArguments[storedParams.index].length > 0) {
            const fieldArray = methodArguments[storedParams.index].split(',');
            fieldArray.forEach((address: string) => {
              if (!utils.isAddress(address)) {
                throw new Error(
                  `Address: ${address} is not a valid smartBCH address`
                );
              }
            });
          }
        }
      }
    });
  }
}

export function IsBchAddressOrEnsValidator(
  target: any,
  propertyName: string,
  methodArguments: any,
  isParamOptional?: boolean[]
): void {
  const addressParameters: paramsType[] = Reflect.getOwnMetadata(
    IsBchAddressOrENSMetadataKey,
    target,
    propertyName
  );

  if (addressParameters) {
    addressParameters.forEach((storedParams) => {
      if (storedParams.field) {
        if (
          methodArguments[0][storedParams.field] &&
          !utils.isAddress(methodArguments[0][storedParams.field])
        ) {
          if (!canBeEnsAddress(methodArguments[0][storedParams.field])) {
            throw new Error(
              `Address ${
                methodArguments[0][storedParams.field]
              } is not valid ENS format or a valid smartBCH address`
            );
          }
        }
      } else {
        const isOptional =
          isParamOptional && isParamOptional[storedParams.index];
        if (
          methodArguments[storedParams.index] &&
          !isOptional &&
          !utils.isAddress(methodArguments[storedParams.index])
        ) {
          if (!canBeEnsAddress(methodArguments[storedParams.index])) {
            throw new Error(
              `Address ${
                methodArguments[storedParams.index]
              } is not valid ENS format or a valid smartBCH address`
            );
          }
        }
      }
    });
  }
}

export function amountGtThan0Validator(
  target: any,
  propertyName: string,
  methodArguments: any,
  isParamOptional?: boolean[]
): void {
  const amountParameters: paramsType[] = Reflect.getOwnMetadata(
    isPositiveMetadataKey,
    target,
    propertyName
  );

  if (amountParameters) {
    amountParameters.forEach((storedParams) => {
      if (storedParams.field) {
        if (
          methodArguments[0][storedParams.field] &&
          !(Number(methodArguments[0][storedParams.field]) > 0)
        ) {
          throw new Error(
            `Amount: ${
              methodArguments[0][storedParams.field]
            } needs to be greater than 0`
          );
        }
      } else {
        const isOptional =
          isParamOptional && isParamOptional[storedParams.index];
        if (!isOptional && !(Number(methodArguments[storedParams.index]) > 0)) {
          throw new Error(
            `Amount: ${
              methodArguments[storedParams.index]
            } needs to be greater than 0`
          );
        }
      }
    });
  }
}

export function amount0OrPositiveValidator(
  target: any,
  propertyName: string,
  methodArguments: any,
  isParamOptional?: boolean[]
): void {
  const amountParameters: paramsType[] = Reflect.getOwnMetadata(
    is0OrPositiveMetadataKey,
    target,
    propertyName
  );

  if (amountParameters) {
    amountParameters.forEach((storedParams) => {
      if (storedParams.field) {
        if (
          methodArguments[0][storedParams.field] &&
          !(Number(methodArguments[0][storedParams.field]) >= 0)
        ) {
          throw new Error(
            `Amount: ${
              methodArguments[0][storedParams.field]
            } needs to be greater than 0`
          );
        }
      } else {
        const isOptional =
          isParamOptional && isParamOptional[storedParams.index];
        if (
          !isOptional &&
          !(Number(methodArguments[storedParams.index]) >= 0)
        ) {
          throw new Error(
            `Amount: ${
              methodArguments[storedParams.index]
            } needs to be greater than 0`
          );
        }
      }
    });
  }
}

export function amountGtThan0OrMinus1(
  target: any,
  propertyName: string,
  methodArguments: any,
  isParamOptional?: boolean[]
): void {
  const amountMinusOneParameters: paramsType[] = Reflect.getOwnMetadata(
    isPositiveOrMinusOneMetadataKey,
    target,
    propertyName
  );

  if (amountMinusOneParameters) {
    amountMinusOneParameters.forEach((storedParams) => {
      if (storedParams.field) {
        if (
          methodArguments[0][storedParams.field] &&
          !(
            Number(methodArguments[0][storedParams.field]) > 0 ||
            methodArguments[0][storedParams.field] === '-1'
          )
        ) {
          throw new Error(
            `Amount: ${
              methodArguments[0][storedParams.field]
            } needs to be greater than 0 or -1`
          );
        }
      } else {
        const isOptional =
          isParamOptional && isParamOptional[storedParams.index];
        if (
          !isOptional &&
          !(
            Number(methodArguments[storedParams.index]) > 0 ||
            methodArguments[storedParams.index] === '-1'
          )
        ) {
          throw new Error(
            `Amount: ${
              methodArguments[storedParams.index]
            } needs to be greater than 0 or -1`
          );
        }
      }
    });
  }
}
