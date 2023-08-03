import { styled } from '@mui/material/styles';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import Select from 'src/components/EnhancedSelect/Select';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import { FormControl } from 'src/components/FormControl';
import { FormHelperText } from 'src/components/FormHelperText';
import {
  useLinodeQuery,
  useLinodeUpdateMutation,
} from 'src/queries/linodes/linodes';
import { useProfile } from 'src/queries/profile';
import getUserTimezone from 'src/utilities/getUserTimezone';
import { initWindows } from 'src/utilities/initWindows';

interface Props {
  isReadOnly: boolean;
  linodeId: number;
}

export const ScheduleSettings = (props: Props) => {
  const { isReadOnly, linodeId } = props;
  const { enqueueSnackbar } = useSnackbar();

  const { data: profile } = useProfile();
  const { data: linode } = useLinodeQuery(linodeId);

  const {
    error: updateLinodeError,
    isLoading: isUpdating,
    mutateAsync: updateLinode,
  } = useLinodeUpdateMutation(linodeId);

  const settingsForm = useFormik({
    enableReinitialize: true,
    initialValues: {
      day: linode?.backups.schedule.day,
      window: linode?.backups.schedule.window,
    },
    async onSubmit(values) {
      await updateLinode({
        backups: {
          schedule: values,
        },
      });

      enqueueSnackbar('Backup settings saved', {
        variant: 'success',
      });
    },
  });

  const days = [
    ['Choose a day', 'Scheduling'],
    ['Sunday', 'Sunday'],
    ['Monday', 'Monday'],
    ['Tuesday', 'Tuesday'],
    ['Wednesday', 'Wednesday'],
    ['Thursday', 'Thursday'],
    ['Friday', 'Friday'],
    ['Saturday', 'Saturday'],
  ];

  const windows = initWindows(getUserTimezone(profile?.timezone), true);

  const windowOptions = windows.map((window) => ({
    label: window[0],
    value: window[1],
  }));

  const dayOptions = days.map((day) => ({ label: day[0], value: day[1] }));

  return (
    <Paper>
      <form onSubmit={settingsForm.handleSubmit}>
        <Typography data-qa-settings-heading variant="h2">
          Settings
        </Typography>
        <Typography data-qa-settings-desc marginTop={1} variant="body1">
          Configure when automatic backups are initiated. The Linode Backup
          Service will generate a backup between the selected hours every day,
          and will overwrite the previous daily backup. The selected day is when
          the backup is promoted to the weekly slot. Up to two weekly backups
          are saved.
        </Typography>
        {Boolean(updateLinodeError) && (
          <Notice error spacingBottom={0} spacingTop={16}>
            {updateLinodeError?.[0].reason}
          </Notice>
        )}
        <StyledFormControl>
          <Select
            textFieldProps={{
              dataAttrs: {
                'data-qa-weekday-select': true,
              },
            }}
            value={dayOptions.find(
              (item) => item.value === settingsForm.values.day
            )}
            disabled={isReadOnly}
            isClearable={false}
            label="Day of Week"
            name="Day of Week"
            noMarginTop
            onChange={(item) => settingsForm.setFieldValue('day', item.value)}
            options={dayOptions}
            placeholder="Choose a day"
          />
        </StyledFormControl>
        <FormControl>
          <Select
            onChange={(item) =>
              settingsForm.setFieldValue('window', item.value)
            }
            textFieldProps={{
              dataAttrs: {
                'data-qa-time-select': true,
              },
            }}
            value={windowOptions.find(
              (item) => item.value === settingsForm.values.window
            )}
            disabled={isReadOnly}
            isClearable={false}
            label="Time of Day"
            name="Time of Day"
            noMarginTop
            options={windowOptions}
            placeholder="Choose a time"
          />
          <FormHelperText sx={{ marginLeft: 0 }}>
            Time displayed in{' '}
            {getUserTimezone(profile?.timezone).replace('_', ' ')}
          </FormHelperText>
        </FormControl>
        <StyledActionsPanel
          primaryButtonProps={{
            'data-testid': 'schedule',
            disabled: isReadOnly || !settingsForm.dirty,
            label: 'Save Schedule',
            loading: isUpdating,
            type: 'submit',
          }}
        />
      </form>
    </Paper>
  );
};

const StyledFormControl = styled(FormControl, { label: 'StyledFormControl' })(
  ({ theme }) => ({
    '& .react-select__menu-list': {
      maxHeight: 'none',
    },
    marginRight: theme.spacing(2),
    minWidth: 150,
  })
);

const StyledActionsPanel = styled(ActionsPanel, {
  label: 'StyledActionsPanel',
})(({ theme }) => ({
  '& button': {
    marginLeft: 0,
    marginTop: theme.spacing(2),
  },
  justifyContent: 'flex-start',
  margin: 0,
  padding: 0,
}));
