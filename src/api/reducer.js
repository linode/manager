import { combineReducers } from 'redux';

import * as generic from './generic';


function reducerExporter(module) {
  return module.reducer;
}

export default combineReducers(generic.exportWith(reducerExporter));
