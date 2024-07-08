export const lishLaunch = (linodeId: number) => {
  window.open(
    `${window.location.protocol}//${window.location.host}/linodes/${linodeId}/lish/weblish`,
    `weblish_con_${linodeId}`,
    'left=100,top=100,width=1080,height=730,toolbar=0,resizable=1'
  );
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
