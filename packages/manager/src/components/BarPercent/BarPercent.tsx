import { styled } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import * as React from 'react';

import { LinearProgress } from 'src/components/LinearProgress';
import { isPropValid } from 'src/utilities/isPropValid';

export interface BarPercentProps {
  /** Additional css class to pass to the component */
  className?: string;
  /**
   * Applies a gradient to the filler bar to show
   * when getting close to the limit. (green to red)
   * Orange will show at 75% and red at 90%.
   */
  gradientFiller?: boolean;
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
    gradientFiller,
    isFetchingValue,
    max,
    narrow,
    rounded,
    sx,
    value,
    valueBuffer,
  } = props;

  const fillerRelativePct = (100 / value) * 100;

  return (
    <StyledDiv className={`${className}`}>
      <StyledLinearProgress
        variant={
          isFetchingValue
            ? 'indeterminate'
            : valueBuffer
            ? 'buffer'
            : 'determinate'
        }
        fillerRelativePct={fillerRelativePct}
        gradientFiller={gradientFiller}
        narrow={narrow}
        rounded={rounded}
        sx={sx}
        value={getPercentage(value, max)}
        valueBuffer={valueBuffer}
      />
    </StyledDiv>
  );
};

export default React.memo(BarPercent);

export const getPercentage = (value: number, max: number) =>
  (value / max) * 100;

const StyledDiv = styled('div')({
  alignItems: 'center',
  display: 'flex',
  position: 'relative',
});

const StyledLinearProgress = styled(LinearProgress, {
  label: 'StyledLinearProgress',
  shouldForwardProp: (prop) => isPropValid(['rounded'], prop),
})<Partial<BarPercentProps> & { fillerRelativePct: number }>(
  ({ theme, ...props }) => ({
    '& .MuiLinearProgress-bar2Buffer': {
      backgroundColor: '#99ec79',
    },
    '& .MuiLinearProgress-barColorPrimary': {
      backgroundColor: '#5ad865',
    },
    '& .MuiLinearProgress-dashed': {
      display: 'none',
    },
    backgroundColor: theme.color.grey2,
    borderRadius: props.rounded ? theme.shape.borderRadius : undefined,
    padding: props.narrow ? 8 : 12,
    width: '100%',
    ...(props.gradientFiller && {
      '& .MuiLinearProgress-bar': {
        background: `linear-gradient(90deg, #5ad865 0%, #5ad865 75%, orange 90%, red);`,
        transform: 'none !important',
        width: `${props.fillerRelativePct}%`,
      },
      backgroundColor: 'rgb(231, 231, 231)',
      width: `${props.value}%`,
    }),
  })
);
