import { styled } from '@mui/material/styles';
import * as React from 'react';

interface Props {
  children: string;
}

export const Code = (props: Props) => {
  const { children } = props;

  return <StyledSpan>{children}</StyledSpan>;
};

const StyledSpan = styled('span')(({ theme }) => ({
  backgroundColor: theme.color.grey5,
  borderRadius: theme.spacing(0.3),
  color: theme.color.black,
  fontFamily: '"Ubuntu Mono", monospace, sans-serif',
  margin: '0 2px',
  padding: '0 4px',
}));
