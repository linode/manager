import * as React from 'react';
import { compose } from 'recompose';

import { reportException } from 'src/exceptionReporting';

const CookieWarning: React.FC<{}> = () => {
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
      <a
        style={{
          bottom: 0,
          margin: '1em',
          position: 'absolute',
          right: 0,
        }}
        aria-describedby="external-site"
        href="https://orteil.dashnet.org/cookieclicker/"
        rel="noopener noreferrer"
        target="_blank"
      >
        :)
      </a>
    </div>
  );
};

export default compose<{}, {}>(React.memo)(CookieWarning);
