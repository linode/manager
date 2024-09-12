import ZoomInMap from '@mui/icons-material/ZoomInMap';
import ZoomOutMap from '@mui/icons-material/ZoomOutMap';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

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
        <ZoomInMap
          style={{
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
        style={{
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
});
