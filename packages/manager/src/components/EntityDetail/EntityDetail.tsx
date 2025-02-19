import { omittedProps } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import { styled } from '@mui/material/styles';
import * as React from 'react';

export interface EntityDetailProps {
  body?: JSX.Element;
  footer?: JSX.Element;
  header: JSX.Element;
  noBodyBottomBorder?: boolean;
}

/**
 * EntityDetail provides a framework for the "Detail Summary" components found on:
 *  1. Detail Pages
 *  2. List Pages
 *  3. Dashboard
 * Provide a Header, Body, and Footer and this component provides the proper positioning for each.
 */
export const EntityDetail = (props: EntityDetailProps) => {
  const { body, footer, header, noBodyBottomBorder } = props;

  return (
    <>
      {header}
      {body !== undefined && (
        <GridBody
          footer={footer}
          noBodyBottomBorder={noBodyBottomBorder}
          size={{ xs: 12 }}
        >
          {body}
        </GridBody>
      )}
      {footer !== undefined && (
        <GridFooter body={body} size={{ xs: 12 }}>
          {footer}
        </GridFooter>
      )}
    </>
  );
};

const GridBody = styled(Grid, {
  label: 'EntityDetailGridBody',
  shouldForwardProp: omittedProps(['footer', 'noBodyBottomBorder']),
})<Partial<EntityDetailProps>>(({ theme, ...props }) => ({
  backgroundColor: theme.bg.bgPaper,
  borderBottom:
    props.footer === undefined && props.noBodyBottomBorder
      ? undefined
      : `1px solid ${theme.borderColors.borderTable}`, // @TODO LKE-E: This conditional can be removed when/if the footer is introduced in M3-8348
  borderTop: `1px solid ${theme.borderColors.borderTable}`,
  padding: theme.spacing(),
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
