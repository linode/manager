import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import { Popper, PopperProps, styled } from '@mui/material';
import React from 'react';

export const SelectedIcon = styled(DoneIcon, {
  shouldForwardProp: (prop) => prop != 'visible',
})<{ visible: boolean }>(({ visible }) => ({
  width: 17,
  height: 17,
  marginRight: '5px',
  marginLeft: '-2px',
  visibility: visible ? 'visible' : 'hidden',
}));

export const RemoveIcon = styled(CloseIcon, {
  shouldForwardProp: (prop) => prop != 'visible',
})<{ visible: boolean }>(({ visible }) => ({
  opacity: 0.6,
  width: 18,
  height: 18,
  visibility: visible ? 'visible' : 'hidden',
}));

export const CustomPopper = (props: PopperProps) => {
  return (
    <Popper
      {...props}
      data-qa-autocomplete-popper
      modifiers={[{ name: 'preventOverflow', enabled: false }]}
      style={{
        ...(props.style ?? {}),
        ...(props.style?.width
          ? typeof props.style.width == 'string'
            ? { width: `calc(${props.style.width} + 2px)` }
            : { width: props.style.width + 2 }
          : {}),
      }}
    />
  );
};
