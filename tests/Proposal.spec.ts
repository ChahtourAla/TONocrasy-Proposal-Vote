import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { Proposal } from '../wrappers/Proposal';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Proposal', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Proposal');
    });

    let blockchain: Blockchain;
    let proposal: SandboxContract<Proposal>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        proposal = blockchain.openContract(Proposal.createFromConfig({}, code));

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
});
