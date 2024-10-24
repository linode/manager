import { IconButton } from '@linode/ui';
import Close from '@mui/icons-material/Close';
import * as React from 'react';

interface Props {
  onClick: () => void;
  text: string;
}

export const CloseSnackbar = (props: Props) => {
  const { onClick, text } = props;

  return (
    <IconButton
      sx={(theme) => ({
        color: theme.palette.text.primary,
        padding: theme.spacing(1),
      })}
      onClick={onClick}
      size="large"
      title={text}
    >
      <Close />
    </IconButton>
  );
};
