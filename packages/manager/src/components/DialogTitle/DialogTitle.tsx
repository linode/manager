import * as React from 'react';
import _DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import Close from '@mui/icons-material/Close';
import IconButton from 'src/components/IconButton/IconButton';
import { SxProps } from '@mui/system';

interface DiaglogTitleProps {
  className?: string;
  id?: string;
  onClose?: () => void;
  sx?: SxProps;
  title: string;
}

const DialogTitle = (props: DiaglogTitleProps) => {
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
        }}
      >
        {title}
        {onClose != null && (
          <IconButton
            aria-label="Close"
            data-qa-close-drawer
            onClick={onClose}
            size="large"
            sx={{
              position: 'absolute',
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
