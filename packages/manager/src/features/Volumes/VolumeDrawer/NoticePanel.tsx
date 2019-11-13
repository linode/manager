import * as React from 'react';
import Notice from 'src/components/Notice';

interface Props {
  success?: string;
  error?: string;
  important?: boolean;
}

type CombinedProps = Props;

const NoticePanel: React.FC<CombinedProps> = ({
  success,
  error,
  important
}) => {
  return (
    <>
      {success && (
        <Notice
          success
          important={important}
          spacingBottom={24}
          spacingTop={16}
        >
          {success}
        </Notice>
      )}

      {error && (
        <Notice error important={important} spacingBottom={24} spacingTop={16}>
          {error}
        </Notice>
      )}
    </>
  );
};

export default NoticePanel;
