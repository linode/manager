import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { Accordion } from 'src/components/Accordion';
import { Button } from 'src/components/Button/Button';
import { useFlags } from 'src/hooks/useFlags';
import { useChildAccounts } from 'src/queries/account';
import { useAccountUser } from 'src/queries/accountUsers';
import { useProfile } from 'src/queries/profile';

import CloseAccountDialog from './CloseAccountDialog';
import {
  CHILD_PROXY_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT,
  PARENT_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT,
} from './constants';

const CloseAccountSetting = () => {
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);

  // TODO: Parent/Child - replace this with just a profile query once user_type is returned in profile
  const { data: profile } = useProfile();
  const { data: user } = useAccountUser(profile?.username ?? '');
  const { data: childAccounts } = useChildAccounts({});
  const flags = useFlags();

  const hasChildAccounts = Boolean(
    user?.user_type === 'parent' &&
      childAccounts &&
      childAccounts?.data?.length > 0
  );
  const isCloseAccountDisabled =
    flags.parentChildAccountAccess &&
    (hasChildAccounts ||
      user?.user_type === 'child' ||
      user?.user_type === 'proxy');

  return (
    <>
      <Accordion defaultExpanded={true} heading="Close Account">
        <Grid container direction="column">
          <Grid>
            <Button
              tooltipText={
                hasChildAccounts
                  ? PARENT_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT
                  : CHILD_PROXY_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT
              }
              buttonType="outlined"
              data-testid="close-account-button"
              disabled={isCloseAccountDisabled}
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
