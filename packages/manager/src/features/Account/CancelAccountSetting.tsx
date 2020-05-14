import * as React from 'react';
import Button from 'src/components/Button';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Grid from 'src/components/Grid';
import CancelAccountDialog from './CancelAccountDialog';

interface Props {
  activeSince?: string;
}

type CombinedProps = Props;

const CancelAccountSetting: React.FC<CombinedProps> = ({ activeSince }) => {
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);

  return (
    <>
      <ExpansionPanel heading="Account" defaultExpanded={true}>
        <Grid container direction="column">
          <Grid item>
            {activeSince && (
              <Typography variant="body1">
                Your account has been active since{' '}
                <DateTimeDisplay value={activeSince} format="YYYY-MM-DD" />.
              </Typography>
            )}
          </Grid>
          <Grid item>
            <Button
              buttonType="secondary"
              destructive
              onClick={() => setDialogOpen(true)}
            >
              Cancel Account
            </Button>
          </Grid>
        </Grid>
      </ExpansionPanel>
      <CancelAccountDialog
        open={dialogOpen}
        closeDialog={() => setDialogOpen(false)}
      />
    </>
  );
};

export default CancelAccountSetting;
