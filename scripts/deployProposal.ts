import { Address, toNano } from 'ton-core';
import { Proposal } from '../wrappers/Proposal';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function deployProposal(provider: NetworkProvider) {
    let myAddress = Address.parse('kQBr0J1v2e5-Wnv1Heerjsv4WlOccTpHBhjklHkNvF-F2sfL');

    const myContract = Proposal.createFromConfig(
        {
            dao_address: myAddress,
            proposal_id: 0,
            proposal_type: 0,
            proposer_account: myAddress,
            proposal_description: 'this is a test',
            receiver_account: myAddress,
            submission_time: Date.now(),
            voters_list: [],
            votes_for: 0,
            votes_against: 0,
        },
        await compile('Proposal')
    );

    await provider.deploy(myContract, toNano('0.05'));

    const openedContract = provider.open(myContract);

    console.log('✅ proposal is deployed at address: ', openedContract.address);
    // run methods on `proposal`
}
