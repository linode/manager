import * as React from 'react';

interface Props {
  clientLabel: string;
}

export const LongviewClientRowMock = ({ clientLabel }: Props) => {
  return <div data-testid="longview-client-row">{clientLabel}</div>;
};

export default LongviewClientRowMock;
