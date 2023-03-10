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

    const voteAgainstBefore = await proposal.getVotesAgainst();

    await proposal.sendVoteAgainst(provider.sender());

    ui.write('Waiting for vote to be added...');

    let voteAgainstAfter = await proposal.getVotesAgainst();
    let attempt = 1;
    while (voteAgainstAfter === voteAgainstBefore) {
        ui.setActionPrompt(`Attempt ${attempt}`);
        await sleep(2000);
        voteAgainstAfter = await proposal.getVotesAgainst();
        attempt++;
    }

    ui.clearActionPrompt();
    ui.write('vote against added successfully!');
}
