import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import Button from 'src/components/Button/Button';
import Select from 'src/components/EnhancedSelect/Select';
import Notice from 'src/components/Notice/Notice';
import FormControl from 'src/components/core/FormControl';
import FormHelperText from 'src/components/core/FormHelperText';
import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';
import getUserTimezone from 'src/utilities/getUserTimezone';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import { useGrants, useProfile } from 'src/queries/profile';
import { initWindows } from 'src/utilities/initWindows';
import {
  useLinodeQuery,
  useLinodeUpdateMutation,
} from 'src/queries/linodes/linodes';

const useStyles = makeStyles((theme: Theme) => ({
  scheduleAction: {
    padding: 0,
    '& button': {
      marginLeft: 0,
      marginTop: theme.spacing(2),
    },
  },
  chooseDay: {
    marginRight: theme.spacing(2),
    minWidth: 150,
    '& .react-select__menu-list': {
      maxHeight: 'none',
    },
  },
}));

interface Props {
  linodeId: number;
}

export const ScheduleSettings = ({ linodeId }: Props) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();
  const { data: linode } = useLinodeQuery(linodeId);

  const doesNotHavePermission =
    Boolean(profile?.restricted) &&
    grants?.linode.find(
      (grant) => grant.id === linode?.id && grant.permissions !== 'read_write'
    ) !== undefined;

  const {
    mutateAsync: updateLinode,
    error: updateLinodeError,
    isLoading: isUpdating,
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

  const windowOptions = windows.map((window) => {
    const label = window[0];
    return { label, value: window[1] };
  });

  const dayOptions = days.map((day: string[]) => {
    const label = day[0];
    return { label, value: day[1] };
  });

  return (
    <Paper>
      <form onSubmit={settingsForm.handleSubmit}>
        <Typography variant="h2" data-qa-settings-heading>
          Settings
        </Typography>
        <Typography variant="body1" data-qa-settings-desc>
          Configure when automatic backups are initiated. The Linode Backup
          Service will generate a backup between the selected hours every day,
          and will overwrite the previous daily backup. The selected day is when
          the backup is promoted to the weekly slot. Up to two weekly backups
          are saved.
        </Typography>
        {Boolean(updateLinodeError) && (
          <Notice error spacingTop={16} spacingBottom={0}>
            {updateLinodeError?.[0].reason}
          </Notice>
        )}
        <FormControl className={classes.chooseDay}>
          <Select
            textFieldProps={{
              dataAttrs: {
                'data-qa-weekday-select': true,
              },
            }}
            options={dayOptions}
            onChange={(item) => settingsForm.setFieldValue('day', item.value)}
            value={dayOptions.find(
              (item) => item.value === settingsForm.values.day
            )}
            label="Day of Week"
            placeholder="Choose a day"
            isClearable={false}
            name="Day of Week"
            noMarginTop
          />
        </FormControl>
        <FormControl>
          <Select
            textFieldProps={{
              dataAttrs: {
                'data-qa-time-select': true,
              },
            }}
            options={windowOptions}
            onChange={(item) =>
              settingsForm.setFieldValue('window', item.value)
            }
            value={windowOptions.find(
              (item) => item.value === settingsForm.values.window
            )}
            label="Time of Day"
            placeholder="Choose a time"
            isClearable={false}
            name="Time of Day"
            noMarginTop
          />
          <FormHelperText sx={{ marginLeft: 0 }}>
            Time displayed in{' '}
            {getUserTimezone(profile?.timezone).replace('_', ' ')}
          </FormHelperText>
        </FormControl>
        <ActionsPanel className={classes.scheduleAction}>
          <Button
            buttonType="primary"
            type="submit"
            disabled={doesNotHavePermission || !settingsForm.dirty}
            loading={isUpdating}
            data-qa-schedule
          >
            Save Schedule
          </Button>
        </ActionsPanel>
      </form>
    </Paper>
  );
};
