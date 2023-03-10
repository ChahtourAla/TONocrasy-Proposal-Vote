import { Address, toNano } from 'ton-core';
import { Proposal } from '../wrappers/Proposal';
import { NetworkProvider, sleep } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Proposal address'));

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const proposal = provider.open(Proposal.createFromAddress(address));

    const voteForBefore = await proposal.getVotesFor();

    await proposal.sendVoteFor(provider.sender());

    ui.write('Waiting for vote to be added...');

    let voteForAfter = await proposal.getVotesFor();
    let attempt = 1;
    while (voteForAfter === voteForBefore) {
        ui.setActionPrompt(`Attempt ${attempt}`);
        await sleep(2000);
        voteForAfter = await proposal.getVotesFor();
        attempt++;
    }

    ui.clearActionPrompt();
    ui.write('vote for added successfully!');
}
