import Axios from 'axios';
import { API_ROOT } from 'src/constants';

export const getRegions = () => Axios.get(`${API_ROOT}/regions`)
  .then(response => response.data);
