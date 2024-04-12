import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { Accordion } from 'src/components/Accordion';
import { Button } from 'src/components/Button/Button';
import { useFlags } from 'src/hooks/useFlags';
import { useProfile } from 'src/queries/profile';

import CloseAccountDialog from './CloseAccountDialog';
import {
  CHILD_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT,
  PARENT_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT,
  PROXY_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT,
} from './constants';

const CloseAccountSetting = () => {
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);

  const { data: profile } = useProfile();
  const flags = useFlags();

  // Disable the Close Account button for users with a Parent/Proxy/Child user type.
  const isCloseAccountDisabled = Boolean(
    flags.parentChildAccountAccess && profile?.user_type !== 'default'
  );

  let closeAccountButtonTooltipText;
  const userType = profile?.user_type;
  const caseKey = isCloseAccountDisabled ? userType : 'default';

  switch (caseKey) {
    case 'child':
      closeAccountButtonTooltipText = CHILD_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT;
      break;
    case 'proxy':
      closeAccountButtonTooltipText = PROXY_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT;
      break;
    default:
      closeAccountButtonTooltipText = PARENT_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT;
  }

  return (
    <>
      <Accordion defaultExpanded={true} heading="Close Account">
        <Grid container direction="column">
          <Grid>
            <Button
              buttonType="outlined"
              data-testid="close-account-button"
              disabled={isCloseAccountDisabled}
              onClick={() => setDialogOpen(true)}
              tooltipText={closeAccountButtonTooltipText}
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
