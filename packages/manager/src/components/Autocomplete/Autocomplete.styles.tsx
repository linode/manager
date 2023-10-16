import DoneIcon from '@mui/icons-material/Done';
import Popper, { PopperProps } from '@mui/material/Popper';
import { styled } from '@mui/material/styles';
import React from 'react';

import { omittedProps } from 'src/utilities/omittedProps';

export const StyledListItem = styled('li', {
  label: 'StyledListItem',
  shouldForwardProp: omittedProps(['selectAllOption']),
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

  color: theme.color.headline,
  fontFamily: theme.font.bold,
  fontSize: '1rem',
  marginBottom: '9px',
  position: 'relative',
}));

export const SelectedIcon = styled(DoneIcon, {
  label: 'SelectedIcon',
  shouldForwardProp: (prop) => prop != 'visible',
})<{ visible: boolean }>(({ visible }) => ({
  height: 17,
  marginLeft: '-2px',
  marginRight: '5px',
  visibility: visible ? 'visible' : 'hidden',
  width: 17,
}));

export const CustomPopper = (props: PopperProps) => {
  const { style, ...rest } = props;

  const updatedStyle = {
    ...style,
    width: style?.width
      ? typeof style.width === 'string'
        ? `calc(${style.width} + 2px)`
        : style.width + 2
      : undefined,
  };

  return (
    <Popper
      {...rest}
      data-qa-autocomplete-popper
      modifiers={[{ enabled: false, name: 'preventOverflow' }]}
      style={updatedStyle}
    />
  );
};
