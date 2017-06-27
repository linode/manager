function loadGA(debug = false) {
  /* eslint-disable */
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script',`https://www.google-analytics.com/analytics${debug && '_debug' || ''}.js`,'ga');
  /* eslint-enable */
}

function handleEvent(eventName) {
  document.addEventListener(eventName, function (e) {
    const { cate, action, label, value } = e.detail;
    window.ga('send', 'event', {
      category: cate,
      action: action,
      label: label,
      value: value,
    });
  }, false);
}

function init(environment, GA_ID) {
  if (environment === 'debug') {
    loadGA(true);
    window.ga_debug = { trace: true };
    window.ga('create', GA_ID, { cookieDomain: 'none', debug: true });
  } else {
    loadGA();
    window.ga('create', GA_ID, 'auto');
  }

  handleEvent('modal:submit');
  handleEvent('modal:cancel');
  handleEvent('modal:show');
  handleEvent('modal:close');
  handleEvent('select:change');
};

export const analytics = {
  init: init,
};
