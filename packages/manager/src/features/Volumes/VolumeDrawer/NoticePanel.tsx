import * as React from 'react';

import { Notice } from 'src/components/Notice/Notice';

interface Props {
  error?: string;
  important?: boolean;
  success?: string;
}

type CombinedProps = Props;

const NoticePanel: React.FC<CombinedProps> = ({
  error,
  important,
  success,
}) => {
  return (
    <>
      {success && (
        <Notice
          important={important}
          spacingBottom={24}
          spacingTop={16}
          variant="success"
        >
          {success}
        </Notice>
      )}

      {error && (
        <Notice
          important={important}
          spacingBottom={24}
          spacingTop={16}
          variant="error"
        >
          {error}
        </Notice>
      )}
    </>
  );
};

export default NoticePanel;
