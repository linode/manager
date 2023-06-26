import * as React from 'react';
import _Dialog, { DialogProps as _DialogProps } from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import { Notice } from 'src/components/Notice/Notice';
import DialogContent from 'src/components/core/DialogContent';
import { DialogTitle } from 'src/components/DialogTitle/DialogTitle';
import { isPropValid } from 'src/utilities/isPropValid';
import { styled, useTheme } from '@mui/material/styles';
import { convertForAria } from 'src/utilities/stringUtils';

export interface DialogProps extends _DialogProps {
  className?: string;
  error?: string;
  fullHeight?: boolean;
  title: string;
  titleBottomBorder?: boolean;
}

const Dialog = (props: DialogProps) => {
  const theme = useTheme();
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
        <DialogTitle
          title={title}
          onClose={() => onClose && onClose({}, 'backdropClick')}
          id={titleID}
        />
        {titleBottomBorder && <StyledHr />}
        <DialogContent
          className={className}
          sx={{
            paddingBottom: theme.spacing(3),
          }}
        >
          {error && <Notice text={error} error />}
          {children}
        </DialogContent>
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
    padding: 0,
  },
  '& .MuiDialogActions-root': {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(2),
  },
}));

const StyledHr = styled('hr')({
  backgroundColor: '#e3e5e8',
  border: 'none',
  height: 1,
  margin: '-2em 8px 0px 8px',
  width: '100%',
});

export { Dialog };
