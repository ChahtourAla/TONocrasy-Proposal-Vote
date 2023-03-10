import { getHttpEndpoint } from '@orbs-network/ton-access';
import { mnemonicToWalletKey } from 'ton-crypto';
import { TonClient, WalletContractV4, Address } from 'ton';
import { Proposal } from '../wrappers/Proposal';
import { NetworkProvider } from '@ton-community/blueprint';

export async function main(provider: NetworkProvider) {
    // initialize ton rpc client on testnet
    const endpoint = await getHttpEndpoint({ network: 'testnet' });
    const client = new TonClient({ endpoint });

    // open wallet v4 (notice the correct wallet version here)
    const mnemonic =
        'first scale fan impose seat alcohol art satisfy kick kidney skull horror alone cabbage limb dash hello fit advice release please make load dilemma'; // your 24 secret words
    const key = await mnemonicToWalletKey(mnemonic.split(' '));
    const wallet = WalletContractV4.create({
        publicKey: key.publicKey,
        workchain: 0,
    });

    // open wallet and read the current seqno of the wallet
    const walletContract = client.open(wallet);
    const walletSender = walletContract.sender(key.secretKey);
    const seqno = await walletContract.getSeqno();

    // open Counter instance by address
    const propposalAddress = Address.parse('EQCVQwLCeDkCheg1i5NagFe2q7D4hVcFg3lYmUs2Vk2vLiJ4'); // replace with your address from step 8
    const proposal = new Proposal(propposalAddress);
    const proposalContract = client.open(proposal);

    // send the increment transaction
    await proposalContract.addVoteFor(walletSender, provider);

    // wait until confirmed
    let currentSeqno = seqno;
    while (currentSeqno == seqno) {
        console.log('waiting for transaction to confirm...');
        await sleep(1500);
        currentSeqno = await walletContract.getSeqno();
    }
    console.log('transaction confirmed!');
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
