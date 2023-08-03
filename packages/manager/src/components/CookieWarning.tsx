import * as React from 'react';

import { reportException } from 'src/exceptionReporting';

export const CookieWarning = () => {
  React.useEffect(() => {
    reportException(
      'A user just tried to load Cloud Manager without cookies enabled'
    );
  }, []);

  return (
    <div
      style={{
        margin: '1em',
      }}
    >
      You do not have cookies enabled for this site. In order to interact with
      the Linode Cloud Manager, please enable cookies for cloud.linode.com and
      login.linode.com
    </div>
  );
};
