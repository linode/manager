import DoneIcon from '@mui/icons-material/Done';
import ListItem from '@mui/material/ListItem';
import Popper from '@mui/material/Popper';
import React from 'react';

import type { ListItemProps } from '@mui/material/ListItem';
import type { PopperProps } from '@mui/material/Popper';

export const AutocompleteSelectAllListItem = (props: ListItemProps) => {
  return (
    <ListItem
      sx={(theme) => ({
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
      })}
      {...props}
    />
  );
};

export const SelectedIcon = () => {
  return <DoneIcon sx={{ width: 17, height: 17 }} />;
};

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
      data-qa-autocomplete-popper
      data-testid="autocomplete-popper"
      modifiers={[
        { enabled: false, name: 'preventOverflow' },
        { enabled: !placement, name: 'flip' },
      ]}
      placement={placement}
      style={updatedStyle}
    />
  );
};
