import * as React from 'react';
import { styled } from '@mui/material/styles';

interface Props {
  children: string;
}

const Code = (props: Props) => {
  const { children } = props;

  return <Span>{children}</Span>;
};

export default Code;

const Span = styled('span')(({ theme }) => ({
  backgroundColor: theme.color.grey8,
  fontWeight: 'bold',
  fontFamily: 'Courier',
  color: theme.name === 'dark' ? theme.color.white : theme.color.black,
}));
