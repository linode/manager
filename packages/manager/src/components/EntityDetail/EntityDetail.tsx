/**
 * EntityDetail provides a framework for the "Detail Summary" components found on:
 *  1. Detail Pages
 *  2. List Pages
 *  3. Dashboard
 * Provide a Header, Body, and Footer and this component provides the proper positioning for each.
 */

import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { omittedProps } from '../../utilities/omittedProps';

export interface EntityDetailProps {
  body?: JSX.Element;
  footer: JSX.Element;
  header: JSX.Element;
}

export const EntityDetail = (props: EntityDetailProps) => {
  const { body, footer, header } = props;

  return (
    <>
      {header}
      {body !== undefined && <GridBody xs={12}>{body}</GridBody>}
      <GridFooter body={body} xs={12}>
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

const GridFooter = styled(Grid, {
  label: 'EntityDetailGridFooter',
  shouldForwardProp: omittedProps(['body']),
})<Partial<EntityDetailProps>>(({ theme, ...props }) => ({
  alignItems: 'center',
  backgroundColor: theme.bg.bgPaper,
  borderTop:
    props.body === undefined
      ? `1px solid ${theme.borderColors.borderTable}`
      : undefined,
  display: 'flex',
  flexDirection: 'row',
  padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
}));

export default EntityDetail;
