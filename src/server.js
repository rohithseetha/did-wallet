const express = require('express');
const bodyParser = require('body-parser');
const DIDManager = require('./didManager');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const didManager = new DIDManager();

app.post('/register', (req, res) => {
  try {
    const { wallet, did } = didManager.createDID();
    res.json({ 
      address: wallet.address, 
      privateKey: wallet.privateKey, 
      did: did.did 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/resolve-did/:did', async (req, res) => {
  const did = req.params.did;
  try {
    const didDoc = await didManager.resolveDID(did);
    res.json(didDoc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/sign-transaction', async (req, res) => {
  const { privateKey, transaction } = req.body;
  try {
    const wallet = new ethers.Wallet(privateKey, didManager.provider);
    const signedTransaction = await didManager.signTransaction(wallet, transaction);
    res.json({ signedTransaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
