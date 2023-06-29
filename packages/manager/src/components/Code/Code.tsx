import * as React from 'react';
import { styled } from '@mui/material/styles';

interface Props {
  children: string;
}

export const Code = (props: Props) => {
  const { children } = props;

  return <StyledSpan>{children}</StyledSpan>;
};

const StyledSpan = styled('span')(({ theme }) => ({
  color: theme.color.black,
  fontFamily: '"Ubuntu Mono", monospace, sans-serif',
  margin: '0 2px',
  backgroundColor: theme.color.grey5,
  padding: '0 4px',
}));
