const init = (window: any) => {
  const s = document.createElement('script');
  s.src =
    '//survey.survicate.com/workspaces/544fefca5c4fdc82bd53e2195ca63429/web_surveys.js';
  s.async = true;
  const e = document.getElementsByTagName('script')[0];
  e.parentNode!.insertBefore(s, e);
};

const linkUserID = (opts: any, userId: number) => {
  opts.traits = {
    user_id: userId
  };
};

const initSurvicate = (window: any, userId: number | null = null) => {
  if (userId) {
    linkUserID((window._sva = window._sva || {}), userId);
  }
  init(window);
};

export default initSurvicate;
