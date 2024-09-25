import { IconButton, useTheme } from '@mui/material';
import * as React from 'react';

import ZoomInMap from 'src/assets/icons/zoomin.svg';
import ZoomOutMap from 'src/assets/icons/zoomout.svg';
import { Tooltip } from 'src/components/Tooltip';

import { commonPopperProps } from '../../Utils/CloudPulseWidgetUtils';

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
        <Tooltip
          PopperProps={commonPopperProps}
          placement={'bottom-end'}
          title={'Minimize'}
        >
          <IconButton
            sx={{
              color: theme.color.grey1,
              fontSize: 'x-large',
              height: '34px',
              padding: '0',
            }}
            data-testid="zoom-in"
            onClick={() => handleClick(false)}
          >
            <ZoomInMap />
          </IconButton>
        </Tooltip>
      );
    }

    return (
      <Tooltip
        PopperProps={commonPopperProps}
        placement={'bottom-end'}
        title={'Maximize'}
      >
        <IconButton
          sx={{
            color: theme.color.grey1,
            fontSize: 'x-large',
            height: '34px',
            padding: '0',
          }}
          data-testid="zoom-out"
          onClick={() => handleClick(true)}
        >
          <ZoomOutMap />
        </IconButton>
      </Tooltip>
    );
  };

  return <ToggleZoomer />;
});
