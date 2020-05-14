import * as React from 'react';
import Button from 'src/components/Button';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Grid from 'src/components/Grid';
import CloseAccountDialog from './CloseAccountDialog';

// interface Props {
//   activeSince?: string;
// }

// type CombinedProps = Props;

const CancelAccountSetting: React.FC<{}> = () => {
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);

  return (
    <>
      <ExpansionPanel heading="Close Account" defaultExpanded={true}>
        <Grid container direction="column">
          {/* <Grid item>
            {activeSince && (
              <Typography variant="body1">
                Your account has been active since{' '}
                <DateTimeDisplay value={activeSince} format="YYYY-MM-DD" />.
              </Typography>
            )}
          </Grid> */}
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

export default CancelAccountSetting;
