import { combineReducers } from 'redux';

import apiActionReducerGenerator from './external';


const generics = [
  'distributions', 'regions', 'types', 'linodes', 'volumes', 'stackscripts', 'kernels', 'domains',
  'nodebalancers', 'profile', 'account', 'events', 'tokens', 'clients', 'users', 'tickets', 'apps',
];

// eslint-disable-next-line global-require
const modules = generics.map((name) => require(`./generic/${name}`));
const reducers = {};

const exports = {};

modules.forEach(function (module, i) {
  const name = generics[i];

  exports[name] = apiActionReducerGenerator(module.config, module.actions);
  reducers[name] = module.reducer;
});

exports.reducer = combineReducers(reducers);

export default exports;
