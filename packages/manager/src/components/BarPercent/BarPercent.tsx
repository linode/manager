import { styled } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import * as React from 'react';

import { LinearProgress } from 'src/components/LinearProgress';
import { isPropValid } from 'src/utilities/isPropValid';

export interface BarPercentProps {
  /** Additional css class to pass to the component */
  className?: string;
  /** Applies styles to show that the value is being retrieved. */
  isFetchingValue?: boolean;
  /** The maximum allowed value and should not be equal to min. */
  max: number;
  /** Decreases the height of the bar. */
  narrow?: boolean;
  /** Applies a `border-radius` to the bar. */
  rounded?: boolean;
  sx?: SxProps;
  /** The value of the progress indicator for the determinate and buffer variants. */
  value: number;
  /** The value for the buffer variant. */
  valueBuffer?: number;
}

/**
 * Determinate indicator that displays how long a process will take.
 */
export const BarPercent = (props: BarPercentProps) => {
  const {
    className,
    isFetchingValue,
    max,
    narrow,
    rounded,
    sx,
    value,
    valueBuffer,
  } = props;

  return (
    <StyledDiv className={className}>
      <StyledLinearProgress
        variant={
          isFetchingValue
            ? 'indeterminate'
            : valueBuffer
            ? 'buffer'
            : 'determinate'
        }
        narrow={narrow}
        rounded={rounded}
        sx={sx}
        value={getPercentage(value, max)}
        valueBuffer={valueBuffer}
      />
    </StyledDiv>
  );
};

export const getPercentage = (value: number, max: number) =>
  (value / max) * 100;

const StyledDiv = styled('div')({
  alignItems: 'center',
  display: 'flex',
  position: 'relative',
});

const StyledLinearProgress = styled(LinearProgress, {
  label: 'StyledLinearProgress',
  shouldForwardProp: (prop) => isPropValid(['rounded', 'narrow'], prop),
})<Partial<BarPercentProps>>(({ theme, ...props }) => ({
  '& .MuiLinearProgress-bar2Buffer': {
    backgroundColor: '#5ad865',
  },
  '& .MuiLinearProgress-barColorPrimary': {
    // Increase contrast if we have a buffer bar
    backgroundColor: props.valueBuffer ? '#1CB35C' : '#5ad865',
  },
  '& .MuiLinearProgress-dashed': {
    display: 'none',
  },
  backgroundColor: theme.color.grey2,
  borderRadius: props.rounded ? theme.shape.borderRadius : undefined,
  padding: props.narrow ? 8 : 12,
  width: '100%',
}));
