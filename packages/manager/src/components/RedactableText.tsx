import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Button } from './Button/Button';
import { Stack } from './Stack';
import { Tooltip } from './Tooltip';

interface Props {
  children: JSX.Element | string;
  isTextVisible: boolean;
  isToggleable: boolean;
  toggleButtonProps?: {
    hideText: string;
    isDisabled: boolean;
    showText: string;
  };
}

export const RedactableText = (props: Props) => {
  const { children, isTextVisible, isToggleable, toggleButtonProps } = props;

  const [_isRedacted, setIsRedacted] = React.useState(!isTextVisible);

  const isRedactedButtonText = toggleButtonProps?.showText ?? (
    <VisibilityIcon aria-label="Show" />
  );
  const isVisibleButtonText = toggleButtonProps?.hideText ?? (
    <VisibilityOffIcon aria-label="Hide" />
  );

  // Return early and show the original text.
  if (isTextVisible) {
    return children;
  }

  // children - StyledRootInput width set to 100% causing the margin issue
  return (
    <Stack
      alignItems="center"
      display="flex"
      flexDirection="row"
      justifyContent="flex-start"
    >
      {_isRedacted ? '••••••••••' : children}
      {isToggleable && (
        <Tooltip title={_isRedacted ? 'Show' : 'Hide'}>
          <StyledToggleButton
            disabled={toggleButtonProps?.isDisabled}
            onClick={() => setIsRedacted(!_isRedacted)}
          >
            {_isRedacted ? isRedactedButtonText : isVisibleButtonText}
          </StyledToggleButton>
        </Tooltip>
      )}
    </Stack>
  );
};

const StyledToggleButton = styled(Button, {
  label: 'StyledToggleButton',
})(({ theme }) => ({
  '& svg': {
    color: theme.palette.grey[500],
  },
  fontSize: '0.875rem',
  marginLeft: theme.spacing(),
  minHeight: 'auto',
  minWidth: 'auto',
  padding: 0,
}));
