import { LISH_ROOT, ZONES } from 'src/constants';

import Lish from './Lish';

export const lishLaunch = (linodeId: number) => {
  window.open(
    `${window.location.protocol}//${
      window.location.host
    }/linodes/${linodeId}/lish/weblish`,
    `weblish_con_${linodeId}`,
    'left=100,top=100,width=1080,height=730,toolbar=0,resizable=1'
  );
};

export const getLishSchemeAndHostname = (region: string): string => {
  if (LISH_ROOT.includes('alpha')) {
    /* Note: This is only the case for pre-production environments! */
    return `wss://${LISH_ROOT}`;
  }
  return `wss://${ZONES[region]}.${LISH_ROOT}`;
};

export const resizeViewPort = (width: number, height: number) => {
  if (window.outerWidth) {
    window.resizeTo(
      width + (window.outerWidth - window.innerWidth),
      height + (window.outerHeight - window.innerHeight)
    );
  } else {
    window.resizeTo(1080, 830);
    window.resizeTo(
      width + (1080 - document.body.offsetWidth),
      height + (830 - document.body.offsetHeight)
    );
  }
};

export default Lish;
