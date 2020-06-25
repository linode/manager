/**
 * EntityDetail provides a framework for the "Detail Summary" components found on:
 *  1. Detail Pages
 *  2. List Pages
 *  3. Dashboard
 * Provide a Header, Body, and Footer and this component provides the proper positioning for each.
 */

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
    paddingRight: `20px !important`
  },
  body: {
    padding: 20,
    borderTop: `1px solid #F4F5F6`,
    borderBottom: `1px solid #F4F5F6`
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: `11px 20px`
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
