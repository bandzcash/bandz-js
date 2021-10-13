import { BytesLike } from 'ethers';
import { tSmartBCHAddress } from '.';

export enum ExecutorType {
  Short,
  Long,
}

export type GovCreateType = {
  user: tSmartBCHAddress;
  targets: tSmartBCHAddress[];
  values: string[];
  signatures: string[];
  calldatas: BytesLike[];
  withDelegateCalls: boolean[];
  ipfsHash: BytesLike;
  executor: ExecutorType;
};
export type GovCancelType = {
  user: tSmartBCHAddress;
  proposalId: number;
};
export type GovQueueType = {
  user: tSmartBCHAddress;
  proposalId: number;
};
export type GovExecuteType = {
  user: tSmartBCHAddress;
  proposalId: number;
};
export type GovSubmitVoteType = {
  user: tSmartBCHAddress;
  proposalId: number;
  support: boolean;
};
export type GovSubmitVoteSignType = {
  user: tSmartBCHAddress;
  proposalId: number;
  support: boolean;
  signature: string;
};

export type GovSignVotingType = {
  user: tSmartBCHAddress;
  support: boolean;
  proposalId: number;
  nonce: number;
};

export type GovGetProposalsType = {
  skip: number;
  limit: number;
};

export type GovGetProposalType = {
  proposalId: number;
};

export type GovGetVotingSupplyType = {
  block: number;
  strategy: tSmartBCHAddress;
};

export type GovGetVotingAtBlockType = {
  user: tSmartBCHAddress;
  strategy: tSmartBCHAddress;
  block: number;
};

export type GovGetTokensVotingPower = {
  user: tSmartBCHAddress;
  tokens: tSmartBCHAddress[];
};

export type GovGetVoteOnProposal = {
  proposalId: string;
  user: tSmartBCHAddress;
};
