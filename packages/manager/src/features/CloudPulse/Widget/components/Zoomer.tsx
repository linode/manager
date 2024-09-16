import * as React from 'react';

import ZoomInMap from 'src/assets/icons/cloudpulse_zoomin.svg';
import ZoomOutMap from 'src/assets/icons/cloudpulse_zoomout.svg';

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
