import { combineReducers } from 'redux';
import source from './source';
import datacenter from './datacenter';

const index = combineReducers({ source, datacenter });

export default index;
