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
  body?: JSX.Element;
  footer: JSX.Element;
}

const useStyles = makeStyles((theme: Theme) => ({
  header: {},
  body: {
    paddingRight: theme.spacing(),
    paddingBottom: theme.spacing(),
    backgroundColor: theme.bg.bgPaper,
    borderTop: `1px solid ${theme.borderColors.borderTable}`,
    borderBottom: `1px solid ${theme.borderColors.borderTable}`,
  },
  footer: {
    backgroundColor: theme.bg.bgPaper,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: `10px 16px !important`,
  },
  footerBorder: {
    borderTop: `1px solid ${theme.borderColors.borderTable}`,
  },
}));

export const EntityDetail: React.FC<EntityDetailProps> = (props) => {
  const { header, body, footer } = props;
  const classes = useStyles();

  return (
    <>
      {header}

      {body !== undefined && (
        <Grid item xs={12} className={classes.body}>
          {body}
        </Grid>
      )}
      <Grid
        item
        xs={12}
        className={`${classes.footer} ${
          body === undefined && classes.footerBorder
        }`}
      >
        {footer}
      </Grid>
    </>
  );
};

export default EntityDetail;
