import * as React from 'react';
import _DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import Close from '@mui/icons-material/Close';
import IconButton from 'src/components/IconButton/IconButton';

interface DiaglogTitleProps {
  className?: string;
  onClose?: () => void;
  title: string;
}

const DialogTitle = (props: DialogTitleProps) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const { className, onClose, title } = props;

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
      ref={ref}
      title={title}
    >
      <Box
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
            disableRipple
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
