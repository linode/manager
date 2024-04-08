import ZoomInMap from '@mui/icons-material/ZoomInMap';
import ZoomOutMap from '@mui/icons-material/ZoomOutMap';
import * as React from 'react';

export interface ZoomIconProperties {
  className?: string;
  handleZoomToggle: (zoomIn: boolean) => void;
  zoomIn: boolean;
}

export const ZoomIcon = (props: ZoomIconProperties) => {
  const [zoomIn, setZoomIn] = React.useState<boolean>(props.zoomIn);

  const handleClick = () => {
    setZoomIn((zoomIn) => !zoomIn);
  };

  React.useEffect(() => {
    props.handleZoomToggle(zoomIn);
  });

  const ToggleZoomer = () => {
    if (zoomIn) {
      return <ZoomInMap onClick={handleClick} />;
    }

    return <ZoomOutMap onClick={handleClick} />;
  };

  return (
    <div className={props.className}>
      <ToggleZoomer />
    </div>
  );
};
