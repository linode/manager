import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import Accordion from 'src/components/Accordion';
import Button from 'src/components/Button';
import CloseAccountDialog from './CloseAccountDialog';

const CloseAccountSetting = () => {
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);

  return (
    <>
      <Accordion heading="Close Account" defaultExpanded={true}>
        <Grid container direction="column">
          <Grid>
            <Button buttonType="outlined" onClick={() => setDialogOpen(true)}>
              Close Account
            </Button>
          </Grid>
        </Grid>
      </Accordion>
      <CloseAccountDialog
        open={dialogOpen}
        closeDialog={() => setDialogOpen(false)}
      />
    </>
  );
};

export default React.memo(CloseAccountSetting);
