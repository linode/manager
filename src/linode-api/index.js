import LinodeAPI from './LinodeAPI';
import { API_ROOT } from '~/constants';
import { getStorage } from '~/storage';

const token = getStorage('authentication/oauth-token');

export default LinodeAPI(API_ROOT, token);
