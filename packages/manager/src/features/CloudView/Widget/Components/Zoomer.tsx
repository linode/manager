import ZoomInMap from '@mui/icons-material/ZoomInMap';
import ZoomOutMap from '@mui/icons-material/ZoomOutMap';
import * as React from 'react';

export interface ZoomIconProperties {
  className?: string;
  handleZoomToggle: (zoomIn: boolean) => void;
  zoomIn: boolean;
}

export const ZoomIcon = (props: ZoomIconProperties) => {
  const handleClick = (needZoomIn: boolean) => {
    props.handleZoomToggle(needZoomIn);
  };

  const ToggleZoomer = () => {
    if (props.zoomIn) {
      return <ZoomInMap onClick={() => handleClick(false)} />;
    }

    return <ZoomOutMap onClick={() => handleClick(true)} />;
  };

  return (
    <div className={props.className}>
      <ToggleZoomer />
    </div>
  );
};
