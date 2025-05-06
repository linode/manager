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
  titleSuffix?: JSX.Element;
}

const DialogTitle = (props: DialogTitleProps) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const {
    className,
    id,
    isFetching,
    onClose,
    subtitle,
    sx,
    title,
    titleSuffix,
  } = props;

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
        data-qa-dialog-title={title}
        data-qa-drawer-title={title}
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          lineHeight: '1.5rem',
          position: 'relative',
          width: '100%',
        }}
      >
        <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
          {!isFetching && title}
          {titleSuffix}
        </Box>
        {onClose !== null && (
          <IconButton
            aria-label="Close"
            color="primary"
            data-qa-close-drawer
            onClick={onClose}
            size="large"
            sx={{
              right: '-12px',
            }}
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
