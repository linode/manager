import Weblish from './Weblish';

export const lishLaunch = (linodeId: string) => {
  window.open(
    `${window.location.protocol}//${window.location.host}/linodes/${linodeId}/lish`,
    `weblish_con_${linodeId}`,
    'left=100,top=100,width=1080,height=680,toolbar=0,resizable=1',
  );
}

export default Weblish;