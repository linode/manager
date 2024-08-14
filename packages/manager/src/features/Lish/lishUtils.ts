export const lishLaunch = (linodeId: number) => {
  window.open(
    `${window.location.protocol}//${window.location.host}/linodes/${linodeId}/lish/weblish`,
    `weblish_con_${linodeId}`
  );
};
