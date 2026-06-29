import { omittedProps } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { LinearProgress } from 'src/components/LinearProgress';

import { getCustomColor, getPercentage } from './utils';

import type { SxProps, Theme } from '@mui/material/styles';

export interface BarPercentProps {
  /** Additional css class to pass to the component */
  className?: string;
  /**
   * Allows for custom colors to be applied to the bar.
   * The color will be applied to the bar based on the percentage of the value to the max.
   *
   * @example
   * ```tsx
   * <BarPercent
   *  customColors={[
   *    { color: 'blue', percentage: 10 }, // blue at or above 10%
   *    { color: 'red', percentage: 50 }, // red at or above 50%
   *  ]}
   * [...]
   * />
   * ```
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
  /** When true, render segmented colors. */
  segmented?: boolean;
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
    segmented,
    sx,
    value,
    valueBuffer,
  } = props;

  const percentage = getPercentage(value, max);
  const effectiveValueBuffer = segmented ? undefined : valueBuffer;

  return (
    <StyledDiv className={className}>
      <StyledLinearProgress
        customColors={customColors}
        narrow={narrow}
        rounded={rounded}
        segmented={segmented}
        style={
          {
            ['--linode-bar-percent' as any]: percentage,
          } as React.CSSProperties
        }
        sx={sx}
        value={percentage}
        valueBuffer={effectiveValueBuffer}
        variant={
          isFetchingValue
            ? 'indeterminate'
            : effectiveValueBuffer
              ? 'buffer'
              : 'determinate'
        }
      />
    </StyledDiv>
  );
});

const StyledDiv = styled('div')({
  alignItems: 'center',
  display: 'flex',
  position: 'relative',
});

const StyledLinearProgress = styled(LinearProgress, {
  label: 'StyledLinearProgress',
  shouldForwardProp: omittedProps([
    'rounded',
    'narrow',
    'customColors',
    'segmented',
  ]),
})<Partial<BarPercentProps>>(({ theme, ...props }) => {
  const segmentedBackgroundImage = `linear-gradient(
    90deg,
    ${theme.tokens.color.Green[70]} 0%,
    ${theme.tokens.color.Green[70]} 60%,
    ${theme.tokens.color.Orange[80]} 60%,
    ${theme.tokens.color.Orange[80]} 80%,
    ${theme.tokens.color.Red[80]} 80%,
    ${theme.tokens.color.Red[80]} 100%
  )`;

  return {
    '& .MuiLinearProgress-bar2Buffer': {
      backgroundColor: theme.tokens.color.Green[60],
    },
    '& .MuiLinearProgress-barColorPrimary': {
      ...(props.segmented
        ? {
            backgroundImage: segmentedBackgroundImage,
            backgroundRepeat: 'no-repeat',
            backgroundSize:
              'calc(100 / var(--linode-bar-percent, 1) * 100%) 100%',
            backgroundPosition: 'left',
          }
        : {
            // Increase contrast if we have a buffer bar
            background: props.customColors
              ? getCustomColor(props.customColors, props.value ?? 0)
              : props.valueBuffer
                ? theme.tokens.color.Green[70]
                : theme.tokens.color.Green[60],
          }),
    },
    '& .MuiLinearProgress-dashed': {
      display: 'none',
    },
    backgroundColor: theme.color.grey2,
    borderRadius: props.rounded ? theme.shape.borderRadius : undefined,
    padding: props.narrow ? 8 : 12,
    width: '100%',
  };
});
