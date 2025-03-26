import _CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { omittedProps } from '../../utilities';
import { Box } from '../Box';

import type { CircularProgressProps } from '@mui/material/CircularProgress';
import type { SxProps, Theme } from '@mui/material/styles';

export interface CircleProgressProps
  extends Omit<CircularProgressProps, 'size'> {
  /**
   * Additional child elements to pass in
   */
  children?: JSX.Element;
  /**
   * Removes the padding
   */
  noPadding?: boolean;
  /**
   * Sets the size of the spinner
   * @default "lg"
   */
  size?: 'lg' | 'md' | 'sm' | 'xs';
  /**
   * Additional styles to apply to the root element.
   */
  sx?: SxProps<Theme>;
}

const SIZE_MAP = {
  lg: 124,
  md: 40,
  sm: 20,
  xs: 14,
};

/**
 * Use for short, indeterminate activities requiring user attention. Defaults to large.
 *
 * sizes:
 * xs = 14
 * md = 20
 * md = 40
 * lg = 124
 */
const CircleProgress = (props: CircleProgressProps) => {
  const { children, noPadding, size, sx, ...rest } = props;

  const variant =
    typeof props.value === 'number' ? 'determinate' : 'indeterminate';
  const value = typeof props.value === 'number' ? props.value : 0;

  if (size) {
    return (
      <StyledCustomCircularProgress
        {...rest}
        aria-label="Content is loading"
        data-qa-circle-progress
        data-testid="circle-progress"
        noPadding={noPadding}
        size={noPadding ? SIZE_MAP[size] : SIZE_MAP[size] * 2}
        tabIndex={0}
      />
    );
  }

  return (
    <StyledRootDiv aria-label="Content is loading" sx={sx}>
      {children !== undefined && (
        <Box sx={{ marginTop: 4, position: 'absolute' }}>{children}</Box>
      )}
      <StyledCircularProgress
        {...rest}
        data-qa-circle-progress={value}
        data-testid="circle-progress"
        size={SIZE_MAP['lg']}
        thickness={2}
        value={value}
        variant={variant}
      />
    </StyledRootDiv>
  );
};

export { CircleProgress };

const StyledRootDiv = styled('div')(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  margin: '0 auto 20px',
  position: 'relative',
  [theme.breakpoints.up('md')]: {
    flex: 1,
    height: 300,
  },
  width: '100%',
}));

const StyledCircularProgress = styled(_CircularProgress)(({ theme }) => ({
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    height: '72px !important',
    width: '72px !important',
  },
}));

const StyledCustomCircularProgress = styled(_CircularProgress, {
  shouldForwardProp: omittedProps(['noPadding']),
})<{ noPadding: boolean | undefined }>(({ theme, ...props }) => ({
  padding: `calc(${theme.spacing()} * 1.3)`,
  ...(props.noPadding && {
    padding: 0,
  }),
}));
