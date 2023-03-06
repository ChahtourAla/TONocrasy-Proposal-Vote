import { toNano } from 'ton-core';
import { Proposal } from '../wrappers/Proposal';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const proposal = provider.open(Proposal.createFromConfig({}, await compile('Proposal')));

    await proposal.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(proposal.address);

    // run methods on `proposal`
}
