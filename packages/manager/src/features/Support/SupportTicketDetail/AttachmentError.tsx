import { Notice } from '@linode/ui';
import * as React from 'react';

interface Props {
  fileName: string;
  reason: string;
}

const getText = (fileName: string, reason: string) => {
  return `Error attaching ${fileName}: ${reason}`;
};

export const AttachmentError = (props: Props) => {
  const { fileName, reason } = props;
  return <Notice text={getText(fileName, reason)} variant="error" />;
};
