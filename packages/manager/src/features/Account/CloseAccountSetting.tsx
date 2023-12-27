import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { Accordion } from 'src/components/Accordion';
import { Button } from 'src/components/Button/Button';
import { Notice } from 'src/components/Notice/Notice';
import { useChildAccounts } from 'src/queries/account';

import CloseAccountDialog from './CloseAccountDialog';

const CloseAccountSetting = () => {
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);

  const { data: childAccounts } = useChildAccounts({});

  return (
    <>
      <Accordion defaultExpanded={true} heading="Close Account">
        <Grid container direction="column">
          <Grid>
            {Boolean(childAccounts?.data?.length) && (
              <Notice spacingBottom={20} variant="info">
                Remove child accounts before closing the account.
              </Notice>
            )}
            <Button
              buttonType="outlined"
              disabled={Boolean(childAccounts?.data?.length)}
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
