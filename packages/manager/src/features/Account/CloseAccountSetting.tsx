import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { Accordion } from 'src/components/Accordion';
import { Button } from 'src/components/Button/Button';
import { Notice } from 'src/components/Notice/Notice';
import { useFlags } from 'src/hooks/useFlags';
import { useChildAccounts } from 'src/queries/account';
import { useAccountUser } from 'src/queries/accountUsers';
import { useProfile } from 'src/queries/profile';

import CloseAccountDialog from './CloseAccountDialog';

const CloseAccountSetting = () => {
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);

  // TODO: Parent/Child - replace this with an account query once user_type is returned in capabilities
  const { data: profile } = useProfile();
  const { data: user } = useAccountUser(profile?.username ?? '');
  const { data: childAccounts } = useChildAccounts({});
  const flags = useFlags();

  const hasChildAccounts = Boolean(
    childAccounts && childAccounts?.data?.length > 0
  );
  const closeAccountDisabled =
    flags.parentChildAccountAccess &&
    (hasChildAccounts ||
      user?.user_type === 'child' ||
      user?.user_type === 'proxy');

  return (
    <>
      <Accordion defaultExpanded={true} heading="Close Account">
        <Grid container direction="column">
          <Grid>
            {hasChildAccounts && (
              <Notice spacingBottom={20} variant="info">
                Remove indirect customers before closing the account.
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
