require('dotenv').config();
const { EthrDID } = require('ethr-did');
const { ethers } = require('ethers');
const { getResolver } = require('ethr-did-resolver');
const { Resolver } = require('did-resolver');

// Load environment variables and validate them
const infuraProjectId = process.env.INFURA_PROJECT_ID;

if (!infuraProjectId) {
  throw new Error("Please set INFURA_PROJECT_ID in the .env file");
}

// Log environment variables to ensure they are loaded correctly (remove this in production)
console.log("INFURA_PROJECT_ID:", infuraProjectId);

const provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${infuraProjectId}`);

class DIDManager {
  constructor() {
    this.provider = provider;
  }

  createDID() {
    // Generate a new wallet for each user
    const wallet = ethers.Wallet.createRandom().connect(this.provider);
    const ethrDid = new EthrDID({
      identifier: wallet.address,
      privateKey: wallet.privateKey,
      provider: this.provider,
      chainNameOrId: 'sepolia'
    });
    return {
      wallet,
      did: ethrDid
    };
  }

  async resolveDID(did) {
    if (!did || typeof did !== 'string') {
      throw new Error("Invalid DID provided");
    }
    console.log(`Resolving DID: ${did}`);
    console.log('infura',infuraProjectId)
    const ethrDidResolver = getResolver({
      networks: [
        {
          name: "sepolia",
        //   chainId: 'sepolia',
          rpcUrl: `https://sepolia.infura.io/v3/${infuraProjectId}`,
        //   registry: '0xdca7ef03e98e0dc2b855be647c39abe984fcf21b' // Default registry address, update if necessary
        }
      ]
    });
    const didResolver = new Resolver(ethrDidResolver);
    // const didResolver = new Resolver(this.provider);
    console.log(didResolver)
    const doc = await didResolver.resolve(did);
    return doc;
  }

  async signTransaction(wallet, transaction) {
    const signedTransaction = await wallet.signTransaction(transaction);
    return signedTransaction;
  }
}

module.exports = DIDManager;
