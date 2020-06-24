import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles } from 'src/components/core/styles';
import Grid from 'src/components/Grid';

export interface EntityDetailProps {
  header: JSX.Element;
  body: JSX.Element;
  footer: JSX.Element;
}

const useStyles = makeStyles(() => ({
  header: {
    padding: `0px 20px 0px 0px !important`
  },
  body: {
    padding: '20px 20px 20px 20px !important',
    borderTop: `1px solid #F4F5F6`,
    borderBottom: `1px solid #F4F5F6`
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: `11px 20px !important`
  }
}));

export const EntityDetail: React.FC<EntityDetailProps> = props => {
  const { header, body, footer } = props;
  const classes = useStyles();

  return (
    <Grid container direction="column">
      <Paper>
        <Grid item xs={12} className={classes.header}>
          {header}
        </Grid>
        <Grid item xs={12} className={classes.body}>
          {body}
        </Grid>
        <Grid item xs={12} className={classes.footer}>
          {footer}
        </Grid>
      </Paper>
    </Grid>
  );
};

export default EntityDetail;
