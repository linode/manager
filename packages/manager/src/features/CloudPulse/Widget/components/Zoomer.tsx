import { IconButton, useTheme } from '@mui/material';
import * as React from 'react';

import ZoomInMap from 'src/assets/icons/zoomin.svg';
import ZoomOutMap from 'src/assets/icons/zoomout.svg';

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
        <IconButton
          sx={{
            color: theme.color.grey1,
            fontSize: 'x-large',
            height: '34px',
            padding:0,
          }}
          aria-label="zoom-in"
          data-testid="zoom-in"
          onClick={() => handleClick(false)}
        >
          <ZoomInMap />
        </IconButton>
      );
    }

    return (
      <IconButton
        sx={{
          color: theme.color.grey1,
          fontSize: 'x-large',
          height: '34px',
          minWidth: 'auto',
          padding: 0,
        }}
        aria-label="zoom-out"
        data-testid="zoom-out"
        onClick={() => handleClick(true)}
      >
        <ZoomOutMap />
      </IconButton>
    );
  };

  return <ToggleZoomer />;
});
