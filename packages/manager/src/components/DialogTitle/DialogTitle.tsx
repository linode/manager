import Close from '@mui/icons-material/Close';
import { Box } from 'src/components/Box';
import _DialogTitle from '@mui/material/DialogTitle';
import { SxProps } from '@mui/system';
import * as React from 'react';

import { IconButton } from 'src/components/IconButton';

interface DialogTitleProps {
  className?: string;
  id?: string;
  onClose?: () => void;
  sx?: SxProps;
  title: string;
}

const DialogTitle = (props: DialogTitleProps) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const { className, id, onClose, sx, title } = props;

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
        {title}
        {onClose != null && (
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
            <Close />
          </IconButton>
        )}
      </Box>
    </_DialogTitle>
  );
};

export { DialogTitle };
