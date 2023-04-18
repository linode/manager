import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import CircularProgress, {
  CircularProgressProps,
} from 'src/components/core/CircularProgress';

interface CircleProgressProps extends CircularProgressProps {
  className?: string;
  children?: JSX.Element;
  mini?: boolean;
  noInner?: boolean;
  noPadding?: boolean;
  tag?: boolean;
}

const CircleProgress = (props: CircleProgressProps) => {
  const { className, children, mini, noInner, noPadding, ...rest } = props;

  const variant =
    typeof props.value === 'number' ? 'determinate' : 'indeterminate';
  const value = typeof props.value === 'number' ? props.value : 0;

  if (mini) {
    return (
      <StyledMiniCircularProgress
        size={noPadding ? 22 : 40}
        aria-label="Content is loading"
        data-qa-circle-progress
        data-testid="circle-progress"
        tabIndex={0}
      />
    );
  }

  return (
    <StyledRootDiv className={className} aria-label="Content is loading">
      {children !== undefined && (
        <Box sx={{ position: 'absolute', marginTop: 4 }}>{children}</Box>
      )}
      {noInner !== true && (
        <StyledTopWrapperDiv>
          <StyledTopDiv />
        </StyledTopWrapperDiv>
      )}
      <StyledCircularProgress
        {...rest}
        size={124}
        value={value}
        variant={variant}
        thickness={2}
        data-qa-circle-progress={value}
        data-testid="circle-progress"
      />
    </StyledRootDiv>
  );
};

export { CircleProgress };

const StyledRootDiv = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 20px',
  position: 'relative',
  width: '100%',
  [theme.breakpoints.up('md')]: {
    flex: 1,
    height: 300,
  },
}));

const StyledTopWrapperDiv = styled('div')(({}) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  width: '100%',
  height: '100%',
}));

const StyledTopDiv = styled('div')(({ theme }) => ({
  width: 70,
  height: 70,
  borderRadius: '50%',
  border: '1px solid #999',
  [theme.breakpoints.up('sm')]: {
    width: 120,
    height: 120,
  },
}));

const StyledCircularProgress = styled(CircularProgress)<CircleProgressProps>(
  ({ theme }) => ({
    position: 'relative',
    [theme.breakpoints.down('sm')]: {
      width: '72px !important',
      height: '72px !important',
    },
  })
);

const StyledMiniCircularProgress = styled(
  CircularProgress
)<CircleProgressProps>(({ theme, ...props }) => ({
  padding: `calc(${theme.spacing()} * 1.3)`,
  ...(props.noPadding && {
    padding: 0,
  }),
  ...(props.tag && {
    width: '12px !important',
    height: '12px !important',
    padding: 0,
    marginLeft: 4,
    marginRight: 4,
    '& circle': {
      stroke: 'white',
    },
  }),
}));
