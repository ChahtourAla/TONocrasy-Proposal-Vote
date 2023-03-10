import { getHttpEndpoint } from '@orbs-network/ton-access';
import { TonClient, Address } from 'ton';
import { Proposal } from '../wrappers/Proposal'; 
import { NetworkProvider, sleep} from '@ton-community/blueprint';
// this is the interface class we just implemented

export async function run(provider: NetworkProvider, args: string[]) {
    // initialize ton rpc client on testnet
    const endpoint = await getHttpEndpoint({ network: 'testnet' });
    const client = new TonClient({ endpoint });

    // open Proposal instance by address
    const proposalAddress = Address.parse('EQARiAaEkiSPZcFC1PNOfePXvDSRQT0g4jGep6SeCFo0FI_C'); // replace with proposal address
    const proposal = new Proposal(proposalAddress);
    const proposalContract = client.open(proposal);

    //const counter = provider.open(Proposal.createFromAddress(proposalAddress));
    

   await  proposalContract.sendIncrement(provider.sender())
  
}

//run();
