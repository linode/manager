import React from 'react';

import { Tooltip } from 'src/components/Tooltip';

interface CloudPulseTooltipProps {
  children: any;
  title: string;
}

export const CloudPulseTooltip = React.memo((props: CloudPulseTooltipProps) => {
  return (
    <Tooltip
      PopperProps={{
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, -8], // Adjust offset if needed
            },
          },
        ],
        sx: {
          '& .MuiTooltip-tooltip': {
            bgcolor: 'black',
            color: 'white',
            fontSize: '14px',
            maxHeight: '28px',
            maxWidth: '120px',
            padding: '6px',
          },
        },
      }}
      placement={'bottom-end'}
      title={props.title}
    >
      <span>{props.children}</span>
    </Tooltip>
  );
});
