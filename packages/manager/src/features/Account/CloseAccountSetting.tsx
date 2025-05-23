import { useProfile } from '@linode/queries';
import { Box, Button, Paper, Typography } from '@linode/ui';
import * as React from 'react';

import CloseAccountDialog from './CloseAccountDialog';
import {
  CHILD_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT,
  PARENT_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT,
  PROXY_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT,
} from './constants';

const CloseAccountSetting = () => {
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);

  const { data: profile } = useProfile();

  // Disable the Close Account button for users with a Parent/Proxy/Child user type.
  const isCloseAccountDisabled = Boolean(profile?.user_type !== 'default');

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
      <Paper data-testid="close-account">
        <Typography variant="h2">Close Account</Typography>
        <Box mt={1}>
          <Button
            buttonType="outlined"
            data-testid="close-account-button"
            disabled={isCloseAccountDisabled}
            onClick={() => setDialogOpen(true)}
            tooltipText={closeAccountButtonTooltipText}
          >
            Close Account
          </Button>
        </Box>
      </Paper>
      <CloseAccountDialog
        closeDialog={() => setDialogOpen(false)}
        open={dialogOpen}
      />
    </>
  );
};

export default React.memo(CloseAccountSetting);
