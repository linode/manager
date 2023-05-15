/**
 * EntityDetail provides a framework for the "Detail Summary" components found on:
 *  1. Detail Pages
 *  2. List Pages
 *  3. Dashboard
 * Provide a Header, Body, and Footer and this component provides the proper positioning for each.
 */

import * as React from 'react';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';

export interface EntityDetailProps {
  header: JSX.Element;
  body?: JSX.Element;
  footer: JSX.Element;
}

export const EntityDetail = (props: EntityDetailProps) => {
  const { header, body, footer } = props;

  return (
    <>
      {header}

      {body !== undefined && <GridBody xs={12}>{body}</GridBody>}
      <GridFooter xs={12} body={body}>
        {footer}
      </GridFooter>
    </>
  );
};

const GridBody = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.bg.bgPaper,
  borderBottom: `1px solid ${theme.borderColors.borderTable}`,
  borderTop: `1px solid ${theme.borderColors.borderTable}`,
  paddingBottom: theme.spacing(),
  paddingRight: theme.spacing(),
}));

const GridFooter = styled(Grid)<Partial<EntityDetailProps>>(
  ({ theme, ...props }) => ({
    alignItems: 'center',
    backgroundColor: theme.bg.bgPaper,
    borderTop:
      props.body === undefined
        ? `1px solid ${theme.borderColors.borderTable}`
        : '',
    display: 'flex',
    flexDirection: 'row',
    padding: `7px 16px`,
  })
);

export default EntityDetail;
