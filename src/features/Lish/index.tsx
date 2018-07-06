import Lish from './Lish';

import { LISH_ROOT, ZONES } from 'src/constants';

export const lishLaunch = (linodeId: string) => {
  window.open(
    `${window.location.protocol}//${window.location.host}/linodes/${linodeId}/lish/weblish`,
    `weblish_con_${linodeId}`,
    'left=100,top=100,width=1080,height=728,toolbar=0,resizable=1',
  );
}
  
export const getLishSchemeAndHostname = (region: string): string => {
  if (LISH_ROOT.includes('alpha')) {
    /* Note: This is only the case for pre-production environments! */
    return `wss://${LISH_ROOT}`;
  }
  return `wss://${ZONES[region]}.${LISH_ROOT}`;
}

export default Lish;