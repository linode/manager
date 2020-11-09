import * as React from 'react';
import Button from 'src/components/Button';
import ExpansionPanel from 'src/components/Accordion';
import Grid from 'src/components/Grid';
import CloseAccountDialog from './CloseAccountDialog';

const CloseAccountSetting: React.FC<{}> = () => {
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);

  return (
    <>
      <ExpansionPanel heading="Close Account" defaultExpanded={true}>
        <Grid container direction="column">
          <Grid item>
            <Button
              buttonType="secondary"
              destructive
              onClick={() => setDialogOpen(true)}
            >
              Close Account
            </Button>
          </Grid>
        </Grid>
      </ExpansionPanel>
      <CloseAccountDialog
        open={dialogOpen}
        closeDialog={() => setDialogOpen(false)}
      />
    </>
  );
};

export default React.memo(CloseAccountSetting);
