
import fetchWorker from '../../lib/fetch.worker';
import promise from 'bluebird';
import { COIN, COINS, ERROR, TXS, WATCH_ADD, WATCH_REMOVE } from '../constants';

const promises = new Map();
const worker = new fetchWorker();

worker.onerror = (err) =>
{
  console.log(err);
  return err;
};

worker.onmessage = (ev) =>
{
  const p = promises.get(ev.data.type);
  if (!p)
  {
    return false;
  }

  if (ev.data.error)
  {
    p.reject(ev.data.error);
    promises.delete(ev.data.type);
    return false;
  }

  p.resolve(ev.data.data);

  return true;
};

const getFromWorker = (type, resolve, reject, query = null) =>
{
  promises.set(type, { resolve, reject });
  worker.postMessage({ query, type });

  return true;
};

export const getAddress = query => new promise((resolve, reject) => getFromWorker('address', resolve, reject, query));

export const getBlock = query => new promise((resolve, reject) => getFromWorker('block', resolve, reject, query));

export const getCoinHistory = (dispatch, query) => new promise((resolve, reject) => getFromWorker('coins', payload =>
{
  if (payload && payload.length)
  {
    dispatch({ payload: payload[0], type: COIN });
  }

  dispatch({ payload, type: COINS });
  resolve(payload);
},
  payload =>
  {
    dispatch({ payload, type: ERROR });
    reject(payload);
  },

  query
));

export const getCoinsWeek = () => new promise((resolve, reject) => getFromWorker('coins-week', resolve, reject));

export const getIsBlock = query => new promise((resolve, reject) => getFromWorker('is-block', resolve, reject, query));

export const getMNs = query => new promise((resolve, reject) => getFromWorker('mns', resolve, reject, query)); // Resolves to getMNs in fetch.worker.js

export const getPeers = () => new promise((resolve, reject) => getFromWorker('peers', peers =>
{
  resolve(peers.map((peer) =>
  {
    const parts = peer.ip.split('.');
    parts[3] = 'XXX';
    peer.ip = parts.join('.');
    return peer;
  }));
},
  reject
));

export const getSupply = dispatch => new promise((resolve, reject) => getFromWorker('supply', resolve, reject));

export const getTop100 = () => new promise((resolve, reject) => getFromWorker('top-100', resolve, reject));

export const getTX = query => new promise((resolve, reject) => getFromWorker('tx', resolve, reject, query));

export const getTXLatest = (dispatch, query) => new promise((resolve, reject) => getFromWorker('txs-latest', payload =>
{
  if (dispatch)
  {
    dispatch({ payload, type: TXS });
  }

  resolve(payload);
},
  payload =>
  {
    if (dispatch)
    {
      dispatch({ payload, type: ERROR });
    }
    reject(payload);
  },
  query
));

export const getTXs = (dispatch, query) => new promise((resolve, reject) => getFromWorker('txs', payload =>
{
  if (dispatch)
  {
    dispatch({ payload, type: TXS });
  }
  resolve(payload);
},
  (payload) =>
  {
    if (dispatch)
    {
      dispatch({ payload, type: ERROR });
    }
    reject(payload);
  },
  query
));

export const getTXsWeek = () => new promise((resolve, reject) => getFromWorker('txs-week', resolve, reject));

export const setTXs = (dispatch, txs) => dispatch({ payload: txs, type: TXS });

export const setWatch = (dispatch, term) => dispatch({ payload: term, type: WATCH_ADD });

export const removeWatch = (dispatch, term) => dispatch({ payload: term, type: WATCH_REMOVE });

export default
  {
    getAddress,
    getBlock,
    getCoinHistory,
    getCoinsWeek,
    getIsBlock,
    getMNs,
    getPeers,
    getSupply,
    getTop100,
    getTX,
    getTXLatest,
    getTXs,
    getTXsWeek,
    setTXs,
    setWatch,
    removeWatch
  };
