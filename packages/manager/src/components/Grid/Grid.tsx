import * as React from 'react';
import Grid, { GridProps } from 'src/components/core/Grid';
import RenderGuard from 'src/components/RenderGuard';

/* tslint:disable-next-line */
export interface Props extends GridProps {}

const WrappedGrid: React.StatelessComponent<Props> = props => {
  const updatedProps: GridProps = {
    ...props,
    /** re: https://github.com/mui-org/material-ui/pull/10768 */
    ...(props.container && !props.spacing && { spacing: 16 })
  };

  return <Grid {...updatedProps}>{props.children}</Grid>;
};

export default RenderGuard<GridProps>(WrappedGrid);
