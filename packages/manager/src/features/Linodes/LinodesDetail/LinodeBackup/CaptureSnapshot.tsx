import { styled } from '@mui/material/styles';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { FormControl } from 'src/components/FormControl';
import { Paper } from 'src/components/Paper';
import { resetEventsPolling } from 'src/eventsPolling';
import { useLinodeBackupSnapshotMutation } from 'src/queries/linodes/backups';
import { getErrorMap } from 'src/utilities/errorUtils';

import { CaptureSnapshotConfirmationDialog } from './CaptureSnapshotConfirmationDialog';

interface Props {
  isReadOnly: boolean;
  linodeId: number;
}

export const CaptureSnapshot = (props: Props) => {
  const { isReadOnly, linodeId } = props;
  const { enqueueSnackbar } = useSnackbar();

  const {
    error: snapshotError,
    isLoading: isSnapshotLoading,
    mutateAsync: takeSnapshot,
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
      <Typography data-qa-manual-heading variant="h2">
        Manual Snapshot
      </Typography>
      <Typography data-qa-manual-desc marginTop={1} variant="body1">
        You can make a manual backup of your Linode by taking a snapshot.
        Creating the manual snapshot can take several minutes, depending on the
        size of your Linode and the amount of data you have stored on it. The
        manual snapshot will not be overwritten by automatic backups.
      </Typography>
      <FormControl>
        {hasErrorFor.none && (
          <Notice error spacingBottom={8}>
            {hasErrorFor.none}
          </Notice>
        )}
        <StyledBox>
          <TextField
            sx={{ minWidth: 275 }}
            data-qa-manual-name
            errorText={hasErrorFor.label}
            label="Name Snapshot"
            name="label"
            onChange={snapshotForm.handleChange}
            value={snapshotForm.values.label}
          />
          <Button
            buttonType="primary"
            data-qa-snapshot-button
            disabled={snapshotForm.values.label === '' || isReadOnly}
            onClick={() => setIsSnapshotConfirmationDialogOpen(true)}
          >
            Take Snapshot
          </Button>
        </StyledBox>
      </FormControl>
      <CaptureSnapshotConfirmationDialog
        loading={isSnapshotLoading}
        onClose={() => setIsSnapshotConfirmationDialogOpen(false)}
        onSnapshot={() => snapshotForm.handleSubmit()}
        open={isSnapshotConfirmationDialogOpen}
      />
    </Paper>
  );
};

const StyledBox = styled(Box, { label: 'StyledBox' })(({ theme }) => ({
  '& > div': {
    marginRight: theme.spacing(2),
    width: 'auto',
  },
  '& button': {
    marginTop: theme.spacing(4),
  },
  alignItems: 'flex-end',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
}));
