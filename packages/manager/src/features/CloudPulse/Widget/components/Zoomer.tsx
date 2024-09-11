import ZoomInMap from '@mui/icons-material/ZoomInMap';
import ZoomOutMap from '@mui/icons-material/ZoomOutMap';
import * as React from 'react';

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
        <ZoomInMap
          data-testid="zoom-in"
          onClick={() => handleClick(false)}
          style={{ color: 'grey', fontSize: 'x-large' }}
        />
      );
    }

    return (
      <ZoomOutMap
        data-testid="zoom-out"
        onClick={() => handleClick(true)}
        style={{ color: 'grey', fontSize: 'x-large' }}
      />
    );
  };

  return <ToggleZoomer />;
});
