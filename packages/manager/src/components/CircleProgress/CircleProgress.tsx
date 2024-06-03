import _CircularProgress from '@mui/material/CircularProgress';
import { SxProps, styled } from '@mui/material/styles';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { omittedProps } from 'src/utilities/omittedProps';

import type { CircularProgressProps } from '@mui/material/CircularProgress';

interface CircleProgressProps extends Omit<CircularProgressProps, 'size'> {
  /**
   * Additional child elements to pass in
   */
  children?: JSX.Element;
  /**
   * If true, will not show an inner circle beneath the spinning circle
   */
  noInner?: boolean;
  /**
   * Removes the padding
   */
  noPadding?: boolean;
  /**
   * Set spinner to a smaller custom size
   */
  size?: 'md' | 'sm' | 'xs';
  /**
   * Additional styles to apply to the root element.
   */
  sx?: SxProps;
}

const SIZE_MAP = {
  md: 40,
  sm: 20,
  xs: 14,
};

/**
 * Use for short, indeterminate activities requiring user attention.
 */
const CircleProgress = (props: CircleProgressProps) => {
  const { children, noInner, noPadding, size, sx, ...rest } = props;

  const variant =
    typeof props.value === 'number' ? 'determinate' : 'indeterminate';
  const value = typeof props.value === 'number' ? props.value : 0;

  if (size) {
    return (
      <StyledCustomCircularProgress
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
      {noInner !== true && (
        <StyledTopWrapperDiv data-testid="inner-circle-progress">
          <StyledTopDiv />
        </StyledTopWrapperDiv>
      )}
      <StyledCircularProgress
        {...rest}
        data-qa-circle-progress={value}
        data-testid="circle-progress"
        size={124}
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

const StyledTopWrapperDiv = styled('div')(({}) => ({
  alignItems: 'center',
  display: 'flex',
  height: '100%',
  justifyContent: 'center',
  position: 'absolute',
  width: '100%',
}));

const StyledTopDiv = styled('div')(({ theme }) => ({
  border: '1px solid #999',
  borderRadius: '50%',
  height: 70,
  [theme.breakpoints.up('sm')]: {
    height: 120,
    width: 120,
  },
  width: 70,
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
