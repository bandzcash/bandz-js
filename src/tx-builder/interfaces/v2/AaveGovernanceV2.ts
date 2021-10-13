import { SmartBCHTransactionTypeExtended } from '../../types';
import {
  GovCreateType,
  GovCancelType,
  GovQueueType,
  GovExecuteType,
  GovSubmitVoteType,
  GovSubmitVoteSignType,
  GovSignVotingType,
  GovGetProposalsType,
  GovGetProposalType,
  GovGetVotingAtBlockType,
  GovGetVotingSupplyType,
  GovGetTokensVotingPower as GovGetPower,
  GovGetVoteOnProposal,
} from '../../types/GovernanceV2MethodTypes';
import { Proposal, Power, Vote } from '../../types/GovernanceV2ReturnTypes';

export default interface AaveGovernanceV2Interface {
  create: (args: GovCreateType) => Promise<SmartBCHTransactionTypeExtended[]>;
  cancel: (args: GovCancelType) => Promise<SmartBCHTransactionTypeExtended[]>;
  queue: (args: GovQueueType) => Promise<SmartBCHTransactionTypeExtended[]>;
  execute: (args: GovExecuteType) => Promise<SmartBCHTransactionTypeExtended[]>;
  submitVote: (
    args: GovSubmitVoteType
  ) => Promise<SmartBCHTransactionTypeExtended[]>;
  submitVoteBySignature: (
    args: GovSubmitVoteSignType
  ) => Promise<SmartBCHTransactionTypeExtended[]>;
  signVoting: (args: GovSignVotingType) => Promise<string>;
  getProposals: (args: GovGetProposalsType) => Promise<Proposal[]>;
  getProposal: (args: GovGetProposalType) => Promise<Proposal>;
  getPropositionPowerAt: (args: GovGetVotingAtBlockType) => Promise<string>;
  getVotingPowerAt: (args: GovGetVotingAtBlockType) => Promise<string>;
  getTotalPropositionSupplyAt: (
    args: GovGetVotingSupplyType
  ) => Promise<string>;
  getTotalVotingSupplyAt: (args: GovGetVotingSupplyType) => Promise<string>;
  getTokensPower: (args: GovGetPower) => Promise<Power[]>;
  getVoteOnProposal: (args: GovGetVoteOnProposal) => Promise<Vote>;
}
