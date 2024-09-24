import { useTheme } from '@mui/material';
import * as React from 'react';

import ZoomInMap from 'src/assets/icons/zoomin.svg';
import ZoomOutMap from 'src/assets/icons/zoomout.svg';

export interface ZoomIconProperties {
  className?: string;
  handleZoomToggle: (zoomIn: boolean) => void;
  zoomIn: boolean;
}

export const ZoomIcon = React.memo(
  (props: ZoomIconProperties) => {
    const theme = useTheme();

    const handleClick = (needZoomIn: boolean) => {
      props.handleZoomToggle(needZoomIn);
    };

    const ToggleZoomer = () => {
      if (props.zoomIn) {
        return (
          <ZoomInMap
            sx={{
              color: theme.color.grey1,
              fontSize: 'x-large',
              height: '34px',
            }}
            data-testid="zoom-in"
            onClick={() => handleClick(false)}
          />
        );
      }

      return (
        <ZoomOutMap
          sx={{
            color: theme.color.grey1,
            fontSize: 'x-large',
            height: '34px',
          }}
          data-testid="zoom-out"
          onClick={() => handleClick(true)}
        />
      );
    };

    return <ToggleZoomer />;
  },
  (prevProps, nextProps) => prevProps.zoomIn === nextProps.zoomIn
);
