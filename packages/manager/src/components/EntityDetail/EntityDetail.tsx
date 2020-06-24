import * as React from 'react';

import Grid from 'src/components/Grid';
import Paper from 'src/components/core/Paper';
import { makeStyles } from 'src/components/core/styles';

export interface EntityDetailProps {
  header: JSX.Element;
  body: JSX.Element;
  footer: JSX.Element;
}

const useStyles = makeStyles(() => ({
  header: {},
  body: {
    padding: '20px !important',
    borderTop: `1px solid #F4F5F6`,
    borderBottom: `1px solid #F4F5F6`
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: `11px 20px 11px 20px !important`
  }
}));

export const EntityDetail: React.FC<EntityDetailProps> = props => {
  const { header, body, footer } = props;
  const classes = useStyles();

  return (
    <Paper>
      <Grid container direction="column">
        <Grid item xs={12} className={classes.header}>
          {header}
        </Grid>
        <Grid item xs={12} className={classes.body}>
          {body}
        </Grid>
        <Grid item xs={12} className={classes.footer}>
          {footer}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default EntityDetail;
