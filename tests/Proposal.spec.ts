import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Address, Cell, toNano, SendMode, beginCell } from 'ton-core';
import { Proposal } from '../wrappers/Proposal';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';
import { randomAddress } from '@ton-community/test-utils';

describe('Proposal', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Proposal');
    });

    let blockchain: Blockchain;
    let proposal: SandboxContract<Proposal>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        proposal = blockchain.openContract(
            Proposal.createFromConfig(
                {
                    dao_address: randomAddress(),
                    proposal_id: 0,
                    proposal_type: 0,
                    proposer_account: randomAddress(),
                    proposal_description: 'this is a test',
                    receiver_account: randomAddress(),
                    submission_time: Date.now(),
                    voters_list: [],
                    votes_for: 0,
                    votes_against: 0,
                },
                code
            )
        );

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await proposal.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: proposal.address,
            deploy: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and proposal are ready to use
    });

    it('should add vote for', async () => {
        const voter = await blockchain.treasury('voter');
        const votesForBefore = await proposal.getVotesFor();
        console.log('votes for before: ', votesForBefore);
        const addVote = await proposal.sendVoteFor(voter.getSender());
        expect(addVote.transactions).toHaveTransaction({
            from: voter.address,
            to: proposal.address,
            success: true,
        });
        const votesForAfter = await proposal.getVotesFor();
        console.log('votes for after: ', votesForAfter);
        expect(votesForAfter).toBe(votesForBefore + 1);
    });
});
