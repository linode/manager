import * as React from 'react';
import _DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import Close from '@mui/icons-material/Close';
import { IconButton } from 'src/components/IconButton';
import { SxProps } from '@mui/system';

interface DialogTitleProps {
  className?: string;
  id?: string;
  onClose?: () => void;
  sx?: SxProps;
  title: string;
}

const DialogTitle = (props: DialogTitleProps) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const { className, onClose, title, id, sx } = props;

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
        data-qa-drawer-title={title}
        data-qa-dialog-title={title}
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          position: 'relative',
          width: '100%',
          lineHeight: '1.5rem',
        }}
      >
        {title}
        {onClose != null && (
          <IconButton
            color="primary"
            aria-label="Close"
            data-qa-close-drawer
            onClick={onClose}
            size="large"
            sx={{
              right: '-12px',
            }}
          >
            <Close />
          </IconButton>
        )}
      </Box>
    </_DialogTitle>
  );
};

export { DialogTitle };
