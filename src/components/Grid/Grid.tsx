import * as React from 'react';
import Grid, { GridProps } from 'material-ui/Grid';

import RenderGuard from 'src/components/RenderGuard';

const WrappedGrid: React.StatelessComponent<GridProps> = (props) => {
  const updatedProps: GridProps = {
    ...props,
    /** re: https://github.com/mui-org/material-ui/pull/10768 */
    ...((props.container && !props.spacing) && { spacing: 16 }),
  };

  return (
    <Grid {...updatedProps}>{props.children}</Grid>
  );
};

export default RenderGuard<GridProps>(WrappedGrid);
