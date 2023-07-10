import * as React from 'react';
import { Notice } from 'src/components/Notice/Notice';
import FormControl from 'src/components/core/FormControl';
import Paper from 'src/components/core/Paper';
import { Typography } from 'src/components/Typography';
import { Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import { useLinodeBackupSnapshotMutation } from 'src/queries/linodes/backups';
import { useSnackbar } from 'notistack';
import { useFormik } from 'formik';
import { TextField } from 'src/components/TextField';
import { CaptureSnapshotConfirmationDialog } from './CaptureSnapshotConfirmationDialog';
import { Button } from 'src/components/Button/Button';
import { resetEventsPolling } from 'src/eventsPolling';
import { getErrorMap } from 'src/utilities/errorUtils';
import { Box } from 'src/components/Box';

interface Props {
  linodeId: number;
  isReadOnly: boolean;
}

const useStyles = makeStyles()((theme: Theme) => ({
  snapshotFormControl: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    '& > div': {
      width: 'auto',
      marginRight: theme.spacing(2),
    },
    '& button': {
      marginTop: theme.spacing(4),
    },
  },
  snapshotNameField: {
    minWidth: 275,
  },
}));

export const CaptureSnapshot = ({ linodeId, isReadOnly }: Props) => {
  const { classes } = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const {
    mutateAsync: takeSnapshot,
    error: snapshotError,
    isLoading: isSnapshotLoading,
  } = useLinodeBackupSnapshotMutation(linodeId);

  const [
    isSnapshotConfirmationDialogOpen,
    setIsSnapshotConfirmationDialogOpen,
  ] = React.useState(false);

  const snapshotForm = useFormik({
    initialValues: { label: '' },
    async onSubmit(values, formikHelpers) {
      await takeSnapshot(values);
      enqueueSnackbar('Starting to capture snapshot', {
        variant: 'info',
      });
      setIsSnapshotConfirmationDialogOpen(false);
      formikHelpers.resetForm();
      resetEventsPolling();
    },
  });

  const hasErrorFor = getErrorMap(['label'], snapshotError);

  return (
    <Paper>
      <Typography variant="h2" data-qa-manual-heading>
        Manual Snapshot
      </Typography>
      <Typography variant="body1" data-qa-manual-desc marginTop={1}>
        You can make a manual backup of your Linode by taking a snapshot.
        Creating the manual snapshot can take several minutes, depending on the
        size of your Linode and the amount of data you have stored on it. The
        manual snapshot will not be overwritten by automatic backups.
      </Typography>
      <FormControl>
        {hasErrorFor.none && (
          <Notice spacingBottom={8} error>
            {hasErrorFor.none}
          </Notice>
        )}
        <Box className={classes.snapshotFormControl}>
          <TextField
            errorText={hasErrorFor.label}
            label="Name Snapshot"
            name="label"
            value={snapshotForm.values.label}
            onChange={snapshotForm.handleChange}
            data-qa-manual-name
            className={classes.snapshotNameField}
          />
          <Button
            buttonType="primary"
            onClick={() => setIsSnapshotConfirmationDialogOpen(true)}
            data-qa-snapshot-button
            disabled={snapshotForm.values.label === '' || isReadOnly}
          >
            Take Snapshot
          </Button>
        </Box>
      </FormControl>
      <CaptureSnapshotConfirmationDialog
        open={isSnapshotConfirmationDialogOpen}
        onClose={() => setIsSnapshotConfirmationDialogOpen(false)}
        onSnapshot={() => snapshotForm.handleSubmit()}
        loading={isSnapshotLoading}
      />
    </Paper>
  );
};
