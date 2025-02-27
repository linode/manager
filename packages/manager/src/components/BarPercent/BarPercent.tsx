import { omittedProps } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { LinearProgress } from 'src/components/LinearProgress';

import type { SxProps, Theme } from '@mui/material/styles';

export interface BarPercentProps {
  /** Additional css class to pass to the component */
  className?: string;
  /**
   * Allows for custom colors to be applied to the bar.
   * The color will be applied to the bar based on the percentage of the value to the max.
   */
  customColors?: {
    color: string;
    percentage: number;
  }[];
  /** Applies styles to show that the value is being retrieved. */
  isFetchingValue?: boolean;
  /** The maximum allowed value and should not be equal to min. */
  max: number;
  /** Decreases the height of the bar. */
  narrow?: boolean;
  /** Applies a `border-radius` to the bar. */
  rounded?: boolean;
  sx?: SxProps<Theme>;
  /** The value of the progress indicator for the determinate and buffer variants. */
  value: number;
  /** The value for the buffer variant. */
  valueBuffer?: number;
}

/**
 * Determinate indicator that displays how long a process will take.
 */
export const BarPercent = React.memo((props: BarPercentProps) => {
  const {
    className,
    customColors,
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
        customColors={customColors}
        narrow={narrow}
        rounded={rounded}
        sx={sx}
        value={getPercentage(value, max)}
        valueBuffer={valueBuffer}
      />
    </StyledDiv>
  );
});

export const getPercentage = (value: number, max: number) =>
  (value / max) * 100;

const getCustomColor = (
  customColors: BarPercentProps['customColors'],
  percentage: number
) => {
  if (!customColors) {
    return undefined;
  }

  const color = customColors.find((color) => percentage >= color.percentage);
  return color?.color;
};

const StyledDiv = styled('div')({
  alignItems: 'center',
  display: 'flex',
  position: 'relative',
});

const StyledLinearProgress = styled(LinearProgress, {
  label: 'StyledLinearProgress',
  shouldForwardProp: omittedProps(['rounded', 'narrow', 'customColors']),
})<Partial<BarPercentProps>>(({ theme, ...props }) => ({
  '& .MuiLinearProgress-bar2Buffer': {
    backgroundColor: theme.tokens.color.Green[60],
  },
  '& .MuiLinearProgress-barColorPrimary': {
    // Increase contrast if we have a buffer bar
    backgroundColor: props.customColors
      ? getCustomColor(props.customColors, props.value ?? 0)
      : props.valueBuffer
      ? theme.tokens.color.Green[70]
      : theme.tokens.color.Green[60],
  },
  '& .MuiLinearProgress-dashed': {
    display: 'none',
  },
  backgroundColor: theme.color.grey2,
  borderRadius: props.rounded ? theme.shape.borderRadius : undefined,
  padding: props.narrow ? 8 : 12,
  width: '100%',
}));
