import { Box } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { Typography } from 'src/components/Typography';

import { PermSelectValue } from './userPermissionsReducer';
import { Action, UserGrantsState } from './userPermissionsReducer';

interface RenderBillingPermProps {
  dispatch: React.Dispatch<Action>;
  state: UserGrantsState;
}

export const RenderBillingPerm = (props: RenderBillingPermProps) => {
  const { dispatch, state } = props;

  const billingPermOnClick = (value: PermSelectValue) => {
    dispatch({ billingAccess: value, type: 'BILLING_ACCESS_CHANGED' });
  };

  if (!state.grants?.['global']) {
    return null;
  }

  return (
    <Box
      sx={(theme) => ({
        marginTop: theme.spacing(2),
        paddingBottom: 0,
      })}
    >
      <Grid
        sx={(theme) => ({
          marginTop: theme.spacing(2),
          paddingBottom: 0,
        })}
        container
        data-qa-billing-section
        spacing={2}
      >
        <Grid>
          <Typography data-qa-permissions-header="billing" variant="h3">
            Billing Access
          </Typography>
        </Grid>
      </Grid>
      <Grid
        sx={(theme) => ({
          marginTop: theme.spacing(2),
          paddingBottom: 0,
        })}
        container
        spacing={2}
      >
        <SelectionCard
          checked={state.grants['global'].account_access === null}
          data-qa-billing-access="None"
          heading="None"
          onClick={() => billingPermOnClick(null)}
          subheadings={['The user cannot view any billing information.']}
        />
        <SelectionCard
          checked={state.grants['global'].account_access === 'read_only'}
          data-qa-billing-access="Read Only"
          heading="Read Only"
          onClick={() => billingPermOnClick('read_only')}
          subheadings={['Can view invoices and billing info.']}
        />
        <SelectionCard
          subheadings={[
            'Can make payments, update contact and billing info, and will receive copies of all invoices and payment emails.',
          ]}
          checked={state.grants['global'].account_access === 'read_write'}
          data-qa-billing-access="Read-Write"
          heading="Read-Write"
          onClick={() => billingPermOnClick('read_write')}
        />
      </Grid>
    </Box>
  );
};
