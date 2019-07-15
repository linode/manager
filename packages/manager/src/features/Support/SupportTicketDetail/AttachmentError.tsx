import * as React from 'react';
import Notice from 'src/components/Notice';

interface Props {
  fileName: string;
  reason: string;
}

type CombinedProps = Props;

const getText = (fileName: string, reason: string) => {
  return `Error attaching ${fileName}: ${reason}`;
};

const AttachmentError: React.StatelessComponent<CombinedProps> = props => {
  const { fileName, reason } = props;
  return <Notice error text={getText(fileName, reason)} />;
};

export default AttachmentError;
