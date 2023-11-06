import * as React from 'react';
import { styled } from '@mui/material';

interface Props {
  prefixComponent: JSX.Element | null;
  prefixStyle?: React.CSSProperties;
}

export const FinalCrumbPrefix = (props: Props) => {
  const { prefixComponent, prefixStyle } = props;

  return (
    <StyledDiv data-qa-prefixwrapper style={prefixStyle}>
      {prefixComponent}
    </StyledDiv>
  );
};

const StyledDiv = styled('div')(({ theme }) => ({
  '& svg, & img': {
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(1),
    position: 'relative',
    top: -2,
  },
}));
