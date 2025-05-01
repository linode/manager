import { CloseIcon, IconButton } from '@linode/ui';
import * as React from 'react';

interface Props {
  onClick: () => void;
  text: string;
}

export const CloseSnackbar = (props: Props) => {
  const { onClick, text } = props;

  return (
    <IconButton
      onClick={onClick}
      size="large"
      sx={(theme) => ({
        color: theme.palette.text.primary,
        padding: theme.spacing(1),
      })}
      title={text}
    >
      <CloseIcon height={16} width={16} />
    </IconButton>
  );
};
