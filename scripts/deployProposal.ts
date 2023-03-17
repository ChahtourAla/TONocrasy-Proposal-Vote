import { Address, toNano, Dictionary, DictionaryValue } from 'ton-core';
import { Proposal } from '../wrappers/Proposal';
import { Dao } from '../../Dao/wrappers/Dao';
import { compile, NetworkProvider, sleep } from '@ton-community/blueprint';

const ListValue: DictionaryValue<string> = {
    serialize(src: string, builder) {
        builder.storeStringRefTail(src);
    },
    parse(src) {
        return src.loadStringRefTail();
    },
};

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();
    const dao_address = args.length > 0 ? args[0] : await ui.input('Dao address');
    const proposal_type = args.length > 0 ? args[0] : await ui.input('Proposal type');
    const proposal_description = args.length > 0 ? args[0] : await ui.input('Proposal description');
    const receiver_account = args.length > 0 ? args[0] : await ui.input('Receiver address');
    const proposal = provider.open(
        Proposal.createFromConfig(
            {
                dao_address: Address.parse(dao_address),
                proposal_id: 0,
                proposal_type: Number(proposal_type),
                proposer_account: Address.parse('EQBr0J1v2e5-Wnv1Heerjsv4WlOccTpHBhjklHkNvF-F2nxB'),
                proposal_status: 'In progress',
                proposal_description: proposal_description,
                receiver_account: Address.parse(receiver_account),
                submission_time: Date.now(),
                voters_list: Dictionary.empty(Dictionary.Keys.Uint(256), ListValue).set(
                    0,
                    'EQBr0J1v2e5-Wnv1Heerjsv4WlOccTpHBhjklHkNvF-F2nxB'
                ),
                votes_for: 0,
                votes_against: 0,
            },
            await compile('Proposal')
        )
    );

    await proposal.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(proposal.address);

    let daoAddress = Address.parse(dao_address);
    const dao = provider.open(Dao.createFromAddress(daoAddress));
    const proposalsBefore = await dao.getProposalsList();
    const position = proposalsBefore.toString().split('x{45514').length;
    await dao.sendNewProposal(provider.sender(), {
        position: position,
        address: proposal.address.toString(),
    });
    let proposalsAfter = await dao.getProposalsList();
    while (proposalsAfter.equals(proposalsBefore)) {
        await sleep(2000);
        proposalsAfter = await dao.getProposalsList();
    }

    console.log('✅ proposal is deployed at address: ', proposal.address);

    // run methods on `proposal`
}
