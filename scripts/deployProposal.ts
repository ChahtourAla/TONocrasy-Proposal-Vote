import { Address, toNano, Dictionary, DictionaryValue } from 'ton-core';
import { Proposal } from '../wrappers/Proposal';
import { compile, NetworkProvider } from '@ton-community/blueprint';

const ListValue: DictionaryValue<string> = {
    serialize(src: string, builder) {
        builder.storeStringRefTail(src);
    },
    parse(src) {
        return src.loadStringRefTail();
    },
};

export async function run(provider: NetworkProvider) {
    let myAddress = Address.parse('kQBr0J1v2e5-Wnv1Heerjsv4WlOccTpHBhjklHkNvF-F2sfL');
    const proposal = provider.open(
        Proposal.createFromConfig(
            {
                dao_address: myAddress,
                proposal_id: 0,
                proposal_type: 0,
                proposer_account: myAddress,
                proposal_description: 'this is a test',
                receiver_account: myAddress,
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

    console.log('✅ proposal is deployed at address: ', proposal.address);

    // run methods on `proposal`
}
