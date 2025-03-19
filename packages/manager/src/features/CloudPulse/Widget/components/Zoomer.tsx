import { IconButton, styled } from '@mui/material';
import * as React from 'react';

import ZoomInMap from 'src/assets/icons/zoomin.svg';
import ZoomOutMap from 'src/assets/icons/zoomout.svg';

import { CloudPulseTooltip } from '../../shared/CloudPulseTooltip';

export interface ZoomIconProperties {
  className?: string;
  handleZoomToggle: (zoomIn: boolean) => void;
  zoomIn: boolean;
}

export const ZoomIcon = React.memo((props: ZoomIconProperties) => {
  const handleClick = (needZoomIn: boolean) => {
    props.handleZoomToggle(needZoomIn);
  };

  const ToggleZoomer = () => {
    if (props.zoomIn) {
      return (
        <CloudPulseTooltip placement="bottom-end" title="Minimize">
          <IconButton
            sx={{
              fontSize: 'x-large',
              padding: 0,
            }}
            aria-label="Zoom Out"
            data-testid="zoom-out"
            onClick={() => handleClick(false)}
          >
            <StyledZoomOut />
          </IconButton>
        </CloudPulseTooltip>
      );
    }

    return (
      <CloudPulseTooltip placement="bottom-end" title="Maximize">
        <IconButton
          sx={{
            fontSize: 'x-large',
            padding: 0,
          }}
          aria-label="Zoom In"
          data-testid="zoom-in"
          onClick={() => handleClick(true)}
        >
          <StyledZoomIn />
        </IconButton>
      </CloudPulseTooltip>
    );
  };

  return <ToggleZoomer />;
});

const StyledZoomIn = styled(ZoomInMap, { label: 'StyledZoomIn' })(
  ({ theme }) => ({
    '&:hover': {
      '& path': {
        fill: theme.color.blue,
        stroke: theme.color.blue,
      },
      cursor: 'pointer',
    },
  })
);
const StyledZoomOut = styled(ZoomOutMap, { label: 'StyledZoomOut' })(
  ({ theme }) => ({
    '&:hover': {
      '& path': {
        fill: theme.color.blue,
      },
      cursor: 'pointer',
    },
  })
);
