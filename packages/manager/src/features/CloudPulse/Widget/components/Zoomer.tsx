import { IconButton, useTheme } from '@mui/material';
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
  const theme = useTheme();

  const handleClick = (needZoomIn: boolean) => {
    props.handleZoomToggle(needZoomIn);
  };

  const ToggleZoomer = () => {
    if (props.zoomIn) {
      return (
        <CloudPulseTooltip placement="bottom-end" title="Minimize">
          <IconButton
            sx={{
              color: theme.color.grey1,
              fontSize: 'x-large',
              padding: '0',
            }}
            aria-label="Zoom In"
            data-testid="zoom-in"
            onClick={() => handleClick(false)}
          >
            <ZoomInMap />
          </IconButton>
        </CloudPulseTooltip>
      );
    }

    return (
      <CloudPulseTooltip placement="bottom-end" title="Maximize">
        <IconButton
          sx={{
            color: theme.color.grey1,
            fontSize: 'x-large',
            padding: 0,
          }}
          aria-label="Zoom Out"
          data-testid="zoom-out"
          onClick={() => handleClick(true)}
        >
          <ZoomOutMap />
        </IconButton>
      </CloudPulseTooltip>
    );
  };

  return <ToggleZoomer />;
});
