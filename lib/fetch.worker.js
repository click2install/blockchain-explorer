
/**
 * Web Worker
 * Handles the requesting of data in a separate thread
 * to prevent UI pausing.
 */

/**
 * Global configuration object.
 */
require('babel-polyfill');
const Promise = require('bluebird');
const fetch = require('./fetch');

const api = `${process.env.config.api.host}:${process.env.config.api.portWorker}${process.env.config.api.prefix}`;

// Get the address and all transactions related.
const getAddress = ({ address, ...query }) => fetch(`${api}/address/${address}`, query);

// Get the block and transactions.
const getBlock = query => fetch(`${api}/block/${query}`);

// Request the coins.
const getCoins = async (query) =>
{
  try
  {
    const coins = await fetch(`${api}/coin/history`, query);
    const avgBlockTime = await fetch(`${api}/block/average`);
    const avgMNTime = await fetch(`${api}/masternode/average`);

    return Promise.resolve(coins.map(c => ({ ...c, avgBlockTime, avgMNTime })));
  }
  catch (err)
  {
    console.log('fetch.worker ERROR:', err);
    return Promise.reject(err);
  }
};

// Request the coins for a week.
const getCoinsWeek = query => fetch(`${api}/coin/week`, query);

// Check if hash is a block.
const getIsBlock = query => fetch(`${api}/block/is/${query}`);

// Request the list of masternodes.
const getMNs = query => fetch(`${api}/masternode`, query);

// Request the list of connected peers.
const getPeers = () => fetch(`${api}/peer`);

// Request the supply information.
const getSupply = () => fetch(`${api}/supply`);

// Get the top 100 wallets.
const getTop100 = () => fetch(`${api}/top100`);

// Get transaction by its hash.
const getTX = query => fetch(`${api}/tx/${query}`);

// Request the transactions.
const getTXs = query => fetch(`${api}/tx`, query);

// Request the transactions for a week.
const getTXsWeek = query => fetch(`${api}/tx/week`, query);

// Request the latest transactions.
const getTXsLatest = query => fetch(`${api}/tx/latest`, query);

// Handle incoming messages.
self.addEventListener('message', (ev) =>
{
  const lookup =
  {
    address: getAddress,
    block: getBlock,
    coins: getCoins,
    'coins-week': getCoinsWeek,
    'is-block': getIsBlock,
    peers: getPeers,
    mns: getMNs,
    supply: getSupply,
    'top-100': getTop100,
    tx: getTX,
    txs: getTXs,
    'txs-latest': getTXsLatest,
    'txs-week': getTXsWeek
  };

  const wk = self;
  const action = lookup[ev.data.type];

  if (!action)
  {
    return wk.postMessage({ error: new Error(`Type '${ev.data.type}' not found!`); });
  }

  action(ev.data.query)
    .then((data) => wk.postMessage({ data, type: ev.data.type }))
    .catch((err) => k.postMessage({ ...err, type: ev.data.type }));
});
