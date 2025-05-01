import { IconButton } from '@mui/material';
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
  const { handleZoomToggle } = props;

  if (props.zoomIn) {
    return (
      <CloudPulseTooltip placement="bottom-end" title="Minimize">
        <IconButton
          aria-label="Zoom Out"
          color="inherit"
          data-testid="zoom-out"
          onClick={() => handleZoomToggle(false)}
          sx={{
            padding: 0,
          }}
        >
          <ZoomOutMap />
        </IconButton>
      </CloudPulseTooltip>
    );
  }

  return (
    <CloudPulseTooltip placement="bottom-end" title="Maximize">
      <IconButton
        aria-label="Zoom In"
        color="inherit"
        data-testid="zoom-in"
        onClick={() => handleZoomToggle(true)}
        sx={{
          padding: 0,
        }}
      >
        <ZoomInMap />
      </IconButton>
    </CloudPulseTooltip>
  );
});
