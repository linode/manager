export const lishLaunch = (linodeId: number) => {
  window.open(
    `${window.location.protocol}//${window.location.host}/linodes/${linodeId}/lish/weblish`,
    `weblish_con_${linodeId}`,
    // 'left=100,top=100,width=1080,height=730,toolbar=0,resizable=1'
  );
};
