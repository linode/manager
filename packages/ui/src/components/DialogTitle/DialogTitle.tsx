import { CloseIcon, Typography } from '@linode/ui';
import { Box, IconButton } from '@linode/ui';
import _DialogTitle from '@mui/material/DialogTitle';
import * as React from 'react';

import type { SxProps, Theme } from '@mui/material';

export interface DialogTitleProps {
  className?: string;
  id?: string;
  isFetching?: boolean;
  onClose?: () => void;
  subtitle?: string;
  sx?: SxProps<Theme>;
  title: string;
}

const DialogTitle = (props: DialogTitleProps) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const { className, id, isFetching, onClose, subtitle, sx, title } = props;

  React.useEffect(() => {
    if (ref.current === null) {
      return;
    }

    ref.current.focus();
  }, []);

  return (
    <_DialogTitle
      className={className}
      data-qa-dialog-title={title}
      id={id}
      ref={ref}
      sx={sx}
      title={title}
    >
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          lineHeight: '1.5rem',
          position: 'relative',
          width: '100%',
        }}
        data-qa-dialog-title={title}
        data-qa-drawer-title={title}
      >
        <Box component="span">{!isFetching && title}</Box>
        {onClose !== null && (
          <IconButton
            sx={{
              right: '-12px',
            }}
            aria-label="Close"
            color="primary"
            data-qa-close-drawer
            onClick={onClose}
            size="large"
          >
            <CloseIcon data-testid="CloseIcon" />
          </IconButton>
        )}
      </Box>
      {subtitle && <Typography>{subtitle}</Typography>}
    </_DialogTitle>
  );
};

export { DialogTitle };
