import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import CircularProgress, {
  CircularProgressProps,
} from 'src/components/core/CircularProgress';
import { isPropValid } from 'src/utilities/isPropValid';

interface CircleProgressProps extends CircularProgressProps {
  className?: string;
  children?: JSX.Element;
  mini?: boolean;
  noInner?: boolean;
  noPadding?: boolean;
  size?: number;
}

const CircleProgress = (props: CircleProgressProps) => {
  const {
    children,
    className,
    mini,
    noInner,
    noPadding,
    size,
    ...rest
  } = props;

  const variant =
    typeof props.value === 'number' ? 'determinate' : 'indeterminate';
  const value = typeof props.value === 'number' ? props.value : 0;

  if (mini) {
    return (
      <StyledMiniCircularProgress
        size={size ? size : noPadding ? 22 : 40}
        noPadding={noPadding}
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
        <Box sx={{ marginTop: 4, position: 'absolute' }}>{children}</Box>
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

const StyledCircularProgress = styled(CircularProgress)<CircleProgressProps>(
  ({ theme }) => ({
    position: 'relative',
    [theme.breakpoints.down('sm')]: {
      height: '72px !important',
      width: '72px !important',
    },
  })
);

const StyledMiniCircularProgress = styled(CircularProgress, {
  shouldForwardProp: (prop) => isPropValid(['noPadding'], prop),
})<CircleProgressProps>(({ theme, ...props }) => ({
  padding: `calc(${theme.spacing()} * 1.3)`,
  ...(props.noPadding && {
    padding: 0,
  }),
}));
