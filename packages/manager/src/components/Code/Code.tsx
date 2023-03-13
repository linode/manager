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

const Span = styled('span')({
  backgroundColor: '#EEEEEE',
  fontWeight: 'bold',
  fontFamily: 'Courier',
  color: '#000000',
});
