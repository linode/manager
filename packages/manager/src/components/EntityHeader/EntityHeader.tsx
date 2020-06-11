import * as React from 'react';

import Grid from 'src/components/Grid';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import HeaderBreadCrumb, { BreadCrumbProps } from './HeaderBreadCrumb';

export interface HeaderProps extends BreadCrumbProps {
  actions: JSX.Element;
  body: JSX.Element;
}

const useStyles = makeStyles((theme: Theme) => ({
  chip: {
    '& .MuiChip-root': {
      height: 30,
      borderRadius: 15,
      marginTop: 1,
      marginRight: 10,
      fontSize: '.875rem',
      letterSpacing: '.5px',
      minWidth: 140
    }
  }
}));

export const EntityHeader: React.FC<HeaderProps> = props => {
  const { actions, body, iconType, parentLink, parentText, title } = props;
  const classes = useStyles();

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
            {body && (
              <Grid className={classes.chip} item>
                {body}
              </Grid>
            )}
          </Grid>
        </Grid>
        <Grid item>{actions}</Grid>
      </Grid>
    </Paper>
  );
};

export default EntityHeader;
