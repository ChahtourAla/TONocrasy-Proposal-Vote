import { getHttpEndpoint } from '@orbs-network/ton-access';
import { TonClient, Address } from 'ton';
import { Proposal } from '../wrappers/Proposal'; // this is the interface class we just implemented

async function main() {
    // initialize ton rpc client on testnet
    const endpoint = await getHttpEndpoint({ network: 'testnet' });
    const client = new TonClient({ endpoint });

    // open Proposal instance by address
    const proposalAddress = Address.parse('EQCVQwLCeDkCheg1i5NagFe2q7D4hVcFg3lYmUs2Vk2vLiJ4'); // replace with proposal address
    const proposal = new Proposal(proposalAddress);
    const proposalContract = client.open(proposal);

    // call the getter on chain
    const daoAddress = await proposalContract.getDaoAddress();
    const proposalId = await proposalContract.getProposalId();
    const proposalType = await proposalContract.getProposalType();
    const proposerAccount = await proposalContract.getProposaerAccount();
    const proposalDescription = await proposalContract.getProposalDescription();
    const receiverAccount = await proposalContract.getReceiverAccount();
    const submissionTime = await proposalContract.getSubmissionTime();
    const votesFor = await proposalContract.getVotesFor();
    const votesAgainst = await proposalContract.getVotesAgainst();

    const config = {
        daoAddress: daoAddress,
        proposalId: proposalId,
        proposalType: proposalType,
        proposerAccount: proposerAccount,
        proposalDescription: proposalDescription,
        receiverAccount: receiverAccount,
        submissionTime: submissionTime,
        votesFor: votesFor,
        votesAgainst: votesAgainst,
    };
    console.log('value:', config);
}

main();
