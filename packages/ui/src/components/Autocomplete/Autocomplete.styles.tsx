import DoneIcon from '@mui/icons-material/Done';
import Popper from '@mui/material/Popper';
import { styled } from '@mui/material/styles';
import React from 'react';

import { omittedProps } from '../../utilities';

import type { PopperProps } from '@mui/material/Popper';

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
  font: theme.font.bold,
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
  const { placement, style, ...rest } = props;

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
      modifiers={[
        { enabled: false, name: 'preventOverflow' },
        { enabled: !placement, name: 'flip' },
      ]}
      data-qa-autocomplete-popper
      data-testid="autocomplete-popper"
      placement={placement}
      style={updatedStyle}
    />
  );
};
