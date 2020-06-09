import * as React from 'react';

import Grid from 'src/components/Grid';
import Paper from 'src/components/core/Paper';
import HeaderBreadCrumb, { BreadCrumbProps } from './HeaderBreadCrumb';

export interface HeaderProps extends BreadCrumbProps {
  actions: JSX.Element;
}

export const EntityHeader: React.FC<HeaderProps> = props => {
  const { actions, iconType, parentLink, parentText, title } = props;

  return (
    <Paper>
      <Grid container alignItems="center" justify="space-between">
        <Grid item>
          <Grid container direction="row" alignItems="center">
            <HeaderBreadCrumb
              iconType={iconType}
              title={title}
              parentLink={parentLink}
              parentText={parentText}
            />
            {props.children && <Grid item>{props.children}</Grid>}
          </Grid>
        </Grid>
        <Grid item>{actions}</Grid>
      </Grid>
    </Paper>
  );
};

export default EntityHeader;
