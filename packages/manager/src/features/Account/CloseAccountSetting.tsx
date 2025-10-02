import { Box, Button, Paper, Typography } from '@linode/ui';
import * as React from 'react';

import { useDelegationUserType } from '../IAM/hooks/useDelegationUserType';
import { usePermissions } from '../IAM/hooks/usePermissions';
import CloseAccountDialog from './CloseAccountDialog';
import {
  CHILD_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT,
  PARENT_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT,
  PROXY_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT,
} from './constants';

export const CloseAccountSetting = () => {
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);

  const { userType } = useDelegationUserType();

  const { data: permissions } = usePermissions('account', ['cancel_account']);

  // Disable the Close Account button for users with a Parent/Proxy/Child user type.
  const isCloseAccountDisabled = Boolean(userType !== 'default');

  let closeAccountButtonTooltipText;
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
            disabled={isCloseAccountDisabled || !permissions.cancel_account}
            onClick={() => setDialogOpen(true)}
            tooltipText={
              !permissions.cancel_account
                ? "You don't have permission to close this account."
                : closeAccountButtonTooltipText
            }
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
