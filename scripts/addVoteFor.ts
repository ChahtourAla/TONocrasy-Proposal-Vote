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
    const timestamp = await proposal.getSubmissionTime();
    if (Date.now() < timestamp + 240000) {
        const votersBefore = await proposal.getVotersList();
        const position = votersBefore.asSlice.length + 1;

        const voteForBefore = await proposal.getVotesFor();
        await proposal.sendVoteFor(provider.sender(), {
            position: position,
            address: optAddress,
        });

        ui.write('Waiting for vote to be added...');

        let voteForAfter = await proposal.getVotesFor();
        let votersAfter = await proposal.getVotersList();
        let attempt = 1;
        while (voteForAfter === voteForBefore && votersAfter.equals(votersBefore)) {
            ui.setActionPrompt(`Attempt ${attempt}`);
            await sleep(2000);
            voteForAfter = await proposal.getVotesFor();
            votersAfter = await proposal.getVotersList();
            attempt++;
        }

        ui.clearActionPrompt();
        ui.write('vote for added successfully!');
    } else {
        ui.write('Proposal time ended!');
    }
}
