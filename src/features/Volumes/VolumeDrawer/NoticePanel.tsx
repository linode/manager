import * as React from 'react';
import Notice from 'src/components/Notice';

interface Props {
  success?: string;
  error?: string;
  important?: boolean;
}

type CombinedProps = Props;

const NoticePanel: React.StatelessComponent<CombinedProps> = ({
  success,
  error,
  important
}) => {
  return (
    <>
      {success && (
        <Notice success important={important}>
          {success}
        </Notice>
      )}

      {error && (
        <Notice error important={important}>
          {error}
        </Notice>
      )}
    </>
  );
};

export default NoticePanel;
