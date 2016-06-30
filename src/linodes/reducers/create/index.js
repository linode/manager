import { combineReducers } from 'redux';
import source from './source';
import datacenter from './datacenter';
import service from './service';

const index = combineReducers({
  source,
  datacenter,
  service,
});

export default index;
