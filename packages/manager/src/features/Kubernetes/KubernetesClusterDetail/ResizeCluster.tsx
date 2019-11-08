import * as React from 'react';

interface Props {
  text?: string;
}

export type CombinedProps = Props;

export const ResizeCluster: React.FC<Props> = props => {
  return <h2>Hello world</h2>;
};

export default ResizeCluster;
