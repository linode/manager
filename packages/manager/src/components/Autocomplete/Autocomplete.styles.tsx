import DoneIcon from '@mui/icons-material/Done';
import Popper, { PopperProps } from '@mui/material/Popper';
import { styled } from '@mui/material/styles';
import React from 'react';

import { isPropValid } from 'src/utilities/isPropValid';

export const StyledListItem = styled('li', {
  label: 'StyledListItem',
  shouldForwardProp: (prop) => isPropValid(['selectAllOption'], prop),
})(({ theme }) => ({
  '&.MuiAutocomplete-option': {
    overflow: 'unset',
  },

  '&:after': {
    background: theme.color.border3,
    bottom: '-5px',
    content: '""',
    height: '1px',
    left: '-4px',
    position: 'absolute',
    width: '102%',
  },

  marginBottom: '9px',
  position: 'relative',
}));

export const SelectedIcon = styled(DoneIcon, {
  shouldForwardProp: (prop) => prop != 'visible',
})<{ visible: boolean }>(({ visible }) => ({
  height: 17,
  marginLeft: '-2px',
  marginRight: '5px',
  visibility: visible ? 'visible' : 'hidden',
  width: 17,
}));

export const CustomPopper = (props: PopperProps) => {
  return (
    <Popper
      {...props}
      style={{
        ...(props.style ?? {}),
        ...(props.style?.width
          ? typeof props.style.width == 'string'
            ? { width: `calc(${props.style.width} + 2px)` }
            : { width: props.style.width + 2 }
          : {}),
        zIndex: 1,
      }}
      data-qa-autocomplete-popper
      modifiers={[{ enabled: false, name: 'preventOverflow' }]}
    />
  );
};
