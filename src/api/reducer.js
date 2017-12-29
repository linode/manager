import { combineReducers } from 'redux';

import * as generic from './generic';
import linodeTypes from './linodeTypes';


function reducerExporter(module) {
  return module.reducer;
}

let reducers = generic.exportWith(reducerExporter);
reducers = {
  ...reducers,
  linodeTypes,
};

export default combineReducers(reducers);
