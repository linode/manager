import Box from '@mui/material/Box';
import _Dialog, { DialogProps as _DialogProps } from '@mui/material/Dialog';
import { styled, useTheme } from '@mui/material/styles';
import * as React from 'react';

import { DialogTitle } from 'src/components/DialogTitle/DialogTitle';
import { Notice } from 'src/components/Notice/Notice';
import DialogContent from 'src/components/core/DialogContent';
import { isPropValid } from 'src/utilities/isPropValid';
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
    maxWidth = 'md',
    onClose,
    title,
    titleBottomBorder,
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
          id={titleID}
          onClose={() => onClose && onClose({}, 'backdropClick')}
          title={title}
        />
        {titleBottomBorder && <StyledHr />}
        <DialogContent
          sx={{
            paddingBottom: theme.spacing(3),
          }}
          className={className}
        >
          {error && <Notice error text={error} />}
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
