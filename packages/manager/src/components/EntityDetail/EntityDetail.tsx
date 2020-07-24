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
  header: {},
  body: {
    padding: `20px !important`,
    backgroundColor: theme.color.white,
    borderTop: `1px solid ${theme.color.grey9}`,
    borderBottom: `1px solid ${theme.color.grey9}`
  },
  footer: {
    backgroundColor: theme.color.white,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: `11px 12px !important`,
    height: 40
  }
}));

export const EntityDetail: React.FC<EntityDetailProps> = props => {
  const { header, body, footer } = props;
  const classes = useStyles();

  return (
    <div>
      {header}

      <Grid item xs={12} className={classes.body}>
        {body}
      </Grid>
      <Grid item xs={12} className={classes.footer}>
        {footer}
      </Grid>
    </div>
  );
};

export default EntityDetail;
