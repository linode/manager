import { styled } from '@mui/material/styles';
import * as React from 'react';

interface Props {
  children: string;
}

const Code = (props: Props) => {
  const { children } = props;

  return <StyledSpan>{children}</StyledSpan>;
};

export default Code;

const StyledSpan = styled('span')(({ theme }) => ({
  backgroundColor: theme.color.grey8,
  fontWeight: 'bold',
  fontFamily: 'Courier',
  color: theme.name === 'dark' ? theme.color.white : theme.color.black,
}));
