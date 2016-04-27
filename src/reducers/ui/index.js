import { combineReducers } from 'redux';
import { routeReducer } from 'redux-simple-router';
import linodeCreation from './linode-creation';

const rootReducer = combineReducers({
  linodeCreation
});

export default rootReducer;
