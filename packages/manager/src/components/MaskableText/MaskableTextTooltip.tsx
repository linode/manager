import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { styled } from '@mui/material/styles';
import React from 'react';

import { Button } from '../Button/Button';
import { Tooltip } from '../Tooltip';

interface Props {
  handleClick: () => void;
  isMasked: boolean;
}

export const MaskableTextTooltip = (props: Props) => {
  const { handleClick, isMasked } = props;

  return (
    <Tooltip title={isMasked ? 'Show' : 'Hide'}>
      <StyledToggleButton onClick={handleClick}>
        {isMasked ? (
          <VisibilityIcon aria-label="Show" />
        ) : (
          <VisibilityOffIcon aria-label="Hide" />
        )}
      </StyledToggleButton>
    </Tooltip>
  );
};

const StyledToggleButton = styled(Button, {
  label: 'StyledToggleButton',
})(({ theme }) => ({
  '& svg': {
    color: theme.palette.grey[500],
    fontSize: '0.875rem',
  },
  fontSize: '0.875rem',
  marginLeft: theme.spacing(),
  minHeight: 'auto',
  minWidth: 'auto',
  padding: 0,
}));
