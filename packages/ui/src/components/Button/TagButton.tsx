import { styled } from '@mui/material/styles';
import React from 'react';

import { PlusSignIcon } from '../../assets/icons';
import { Button } from './Button';

import type { ButtonProps } from './Button';

interface TagButtonProps extends ButtonProps {
  panel?: boolean;
}

/**
 * A button for Tags. Eventually this treatment will go away,
 * but the sake of the MUI migration we need to keep it around for now, and as a component in order to get rid of
 * spreading excessive styles for everywhere this is used.
 *
 */
export const TagButton = ({ panel, sx, ...props }: TagButtonProps) => {
  return (
    <Button
      buttonType="outlined"
      endIcon={<StyledPlusIcon disabled={props.disabled} />}
      {...props}
      sx={[
        (theme) => ({
          border: 'none',
          color: theme.tokens.alias.Action.Neutral,
          fontSize: '0.875rem',
          minHeight: 30,
          whiteSpace: 'nowrap',
          ...(panel && {
            height: 34,
          }),
          ...(!props.disabled && {
            '&:hover, &:focus': {
              '& svg': {
                color: theme.color.white,
              },
              backgroundColor: theme.color.buttonPrimaryHover,
              border: 'none',
              color: theme.color.white,
            },
            backgroundColor: theme.color.tagButtonBg,
            color: theme.color.tagButtonText,
          }),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
};

const StyledPlusIcon = styled(PlusSignIcon, {
  label: 'StyledPlusIcon',
})(({ theme, ...props }) => ({
  color: props.disabled
    ? theme.name === 'dark'
      ? theme.tokens.color.Neutrals[70]
      : theme.color.disabledText
    : theme.color.tagButtonText,
  height: '10px',
  width: '10px',
}));
