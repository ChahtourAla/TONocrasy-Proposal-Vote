import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type ProposalConfig = {};

export function proposalConfigToCell(config: ProposalConfig): Cell {
    return beginCell().endCell();
}

export class Proposal implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Proposal(address);
    }

    static createFromConfig(config: ProposalConfig, code: Cell, workchain = 0) {
        const data = proposalConfigToCell(config);
        const init = { code, data };
        return new Proposal(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
