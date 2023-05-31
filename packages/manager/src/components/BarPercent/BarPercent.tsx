import { styled } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import * as React from 'react';
import { LinearProgress } from 'src/components/LinearProgress';

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
    max,
    value,
    className,
    valueBuffer,
    isFetchingValue,
    rounded,
    narrow,
    sx,
  } = props;

  return (
    <StyledDiv className={`${className}`}>
      <StyledLinearProgress
        value={getPercentage(value, max)}
        valueBuffer={valueBuffer}
        variant={
          isFetchingValue
            ? 'indeterminate'
            : valueBuffer
            ? 'buffer'
            : 'determinate'
        }
        rounded={rounded}
        narrow={narrow}
        sx={sx}
      />
    </StyledDiv>
  );
};

export default React.memo(BarPercent);

export const getPercentage = (value: number, max: number) =>
  (value / max) * 100;

const StyledDiv = styled('div')({
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
});

const StyledLinearProgress = styled(LinearProgress, {
  label: 'StyledLinearProgress',
})<Partial<BarPercentProps>>(({ theme, ...props }) => ({
  backgroundColor: theme.color.grey2,
  padding: props.narrow ? 8 : 12,
  width: '100%',
  borderRadius: props.rounded ? theme.shape.borderRadius : undefined,
  '& .MuiLinearProgress-barColorPrimary': {
    backgroundColor: '#5ad865',
  },
  '& .MuiLinearProgress-bar2Buffer': {
    backgroundColor: '#99ec79',
  },
  '& .MuiLinearProgress-dashed': {
    display: 'none',
  },
}));
