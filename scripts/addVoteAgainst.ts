import { Address, toNano } from 'ton-core';
import { Proposal } from '../wrappers/Proposal';
import { NetworkProvider, sleep } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Proposal address'));
    const optAddress = args.length > 0 ? args[0] : await ui.input('Enter your address');

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const proposal = provider.open(Proposal.createFromAddress(address));
    const votersBefore = await proposal.getVotersList();
    const position = votersBefore.asSlice.length + 1;
    const voteAgainstBefore = await proposal.getVotesAgainst();

    await proposal.sendVoteAgainst(provider.sender(), {
        position: position,
        address: optAddress,
    });

    ui.write('Waiting for vote to be added...');

    let voteAgainstAfter = await proposal.getVotesAgainst();
    let votersAfter = await proposal.getVotersList();
    let attempt = 1;
    while (voteAgainstAfter === voteAgainstBefore && votersAfter.equals(votersBefore)) {
        ui.setActionPrompt(`Attempt ${attempt}`);
        await sleep(2000);
        voteAgainstAfter = await proposal.getVotesAgainst();
        votersAfter = await proposal.getVotersList();
        attempt++;
    }

    ui.clearActionPrompt();
    ui.write('vote against added successfully!');
}
