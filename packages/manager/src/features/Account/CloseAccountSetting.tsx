import * as React from 'react';
import Button from 'src/components/Button';
import Accordion from 'src/components/Accordion';
import Grid from 'src/components/Grid';
import CloseAccountDialog from './CloseAccountDialog';

const CloseAccountSetting: React.FC<{}> = () => {
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);

  return (
    <>
      <Accordion heading="Close Account" defaultExpanded={true}>
        <Grid container direction="column">
          <Grid item>
            <Button
              buttonType="primary"
              destructive
              onClick={() => setDialogOpen(true)}
            >
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
