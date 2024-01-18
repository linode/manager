import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { Accordion } from 'src/components/Accordion';
import { Button } from 'src/components/Button/Button';
import { Notice } from 'src/components/Notice/Notice';
import { useFlags } from 'src/hooks/useFlags';
import { useChildAccounts } from 'src/queries/account';

import CloseAccountDialog from './CloseAccountDialog';
import { useProfile } from 'src/queries/profile';
import { useAccountUser } from 'src/queries/accountUsers';

const CloseAccountSetting = () => {
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);

  // TODO: Parent/Child - replace this with an account query once user_type is returned in capabilities
  const { data: profile } = useProfile();
  const { data: user } = useAccountUser(profile?.username ?? '');
  const { data: childAccounts } = useChildAccounts({});
  const flags = useFlags();

  const isChildAccount = user?.user_type === 'child';
  const closeAccountDisabled =
    flags.parentChildAccountAccess &&
    (Boolean(childAccounts?.data?.length) || isChildAccount);

  return (
    <>
      <Accordion defaultExpanded={true} heading="Close Account">
        <Grid container direction="column">
          <Grid>
            {closeAccountDisabled && (
              <Notice spacingBottom={20} variant="info">
                {isChildAccount
                  ? 'Contact your business partner to close your account.'
                  : 'Remove indirect customers before closing the account.'}
              </Notice>
            )}
            <Button
              buttonType="outlined"
              data-testid="close-account-button"
              disabled={closeAccountDisabled}
              onClick={() => setDialogOpen(true)}
            >
              Close Account
            </Button>
          </Grid>
        </Grid>
      </Accordion>
      <CloseAccountDialog
        closeDialog={() => setDialogOpen(false)}
        open={dialogOpen}
      />
    </>
  );
};

export default React.memo(CloseAccountSetting);
