import DoneIcon from '@mui/icons-material/Done';
import { styled } from '@mui/material';
import Popper, { PopperProps } from '@mui/material/Popper';
import React from 'react';

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
