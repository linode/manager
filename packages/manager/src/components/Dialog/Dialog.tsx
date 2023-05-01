import * as React from 'react';
import _Dialog, { DialogProps as _DialogProps } from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import Button from 'src/components/Button';
import Close from '@mui/icons-material/Close';
import Notice from 'src/components/Notice';
import Typography from 'src/components/core/Typography';
import { isPropValid } from 'src/utilities/isPropValid';
import { styled } from '@mui/material/styles';
import { convertForAria } from 'src/components/TabLink/TabLink';

export interface DialogProps extends _DialogProps {
  className?: string;
  error?: string;
  fullHeight?: boolean;
  title: string;
  titleBottomBorder?: boolean;
}

const Dialog = (props: DialogProps) => {
  const {
    children,
    className,
    error,
    fullHeight,
    fullWidth,
    title,
    titleBottomBorder,
    maxWidth = 'md',
    onClose,
    ...rest
  } = props;

  const titleID = convertForAria(title);

  return (
    <StyledDialog
      aria-labelledby={titleID}
      data-qa-dialog
      data-qa-drawer
      data-testid="drawer"
      fullHeight={fullHeight}
      fullWidth={fullWidth}
      maxWidth={(fullWidth && maxWidth) ?? undefined}
      onClose={onClose}
      role="dialog"
      title={title}
      {...rest}
    >
      <Box
        sx={{
          alignItems: 'center',
        }}
      >
        <StyledDialogHeader>
          <Typography
            variant="h2"
            id={titleID}
            data-qa-drawer-title={title}
            data-qa-dialog-title={title}
          >
            {title}
          </Typography>

          <StyledButton
            buttonType="secondary"
            onClick={onClose as (e: any) => void}
            data-qa-close-drawer
            aria-label="Close"
          >
            <Close />
          </StyledButton>
        </StyledDialogHeader>
        {titleBottomBorder && <StyledHr />}
        <Box className={className}>
          {error && <Notice text={error} error />}
          {children}
        </Box>
      </Box>
    </StyledDialog>
  );
};

const StyledDialog = styled(_Dialog, {
  shouldForwardProp: (prop) => isPropValid(['fullHeight'], prop),
})<DialogProps>(({ theme, ...props }) => ({
  '& .MuiDialog-paper': {
    height: props.fullHeight ? '100vh' : undefined,
    maxHeight: '100%',
    padding: `${theme.spacing(4)}`,
  },
  '& .MuiDialogActions-root': {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(2),
  },
  '& .MuiBackdrop-root': {
    backgroundColor: 'rgba(0, 0, 0, .3)',
  },
}));

const StyledHr = styled('hr')({
  backgroundColor: '#e3e5e8',
  border: 'none',
  height: 1,
  margin: '-2em 8px 0px 8px',
  width: '100%',
});

const StyledButton = styled(Button)(() => ({
  minHeight: 'auto',
  minWidth: 'auto',
  position: 'absolute',
  right: '-16px',
}));

const StyledDialogHeader = styled(Box)(({ theme }) => ({
  alignItems: 'center',
  backgroundColor: theme.bg.bgPaper,
  display: 'flex',
  justifyContent: 'space-between',
  paddingBottom: theme.spacing(2),
  marginRight: theme.spacing(7),
  position: 'sticky',
  top: 0,
  width: '100%',
  zIndex: 2,
}));

export { Dialog };
