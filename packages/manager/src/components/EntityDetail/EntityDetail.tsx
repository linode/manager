/**
 * EntityDetail provides a framework for the "Detail Summary" components found on:
 *  1. Detail Pages
 *  2. List Pages
 *  3. Dashboard
 * Provide a Header, Body, and Footer and this component provides the proper positioning for each.
 */

import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';

export interface EntityDetailProps {
  header: JSX.Element;
  body: JSX.Element;
  footer: JSX.Element;
}

const useStyles = makeStyles((theme: Theme) => ({
  header: {
    height: 50
  },
  body: {
    padding: `20px !important`,
    backgroundColor: theme.color.white,
    borderTop: `1px solid #F4F5F6`,
    borderBottom: `1px solid #F4F5F6`
  },
  footer: {
    backgroundColor: theme.color.white,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: `11px 12px !important`
  }
}));

export const EntityDetail: React.FC<EntityDetailProps> = props => {
  const { header, body, footer } = props;
  const classes = useStyles();

  return (
    <Grid container direction="column">
      {header}

      <Grid item xs={12} className={classes.body}>
        {body}
      </Grid>
      <Grid item xs={12} className={classes.footer}>
        {footer}
      </Grid>
    </Grid>
  );
};

export default EntityDetail;
