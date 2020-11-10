import { DatabaseMaintenanceSchedule } from '@linode/api-v4/lib/databases/types';
import { APIError } from '@linode/api-v4/lib/types';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Notice from 'src/components/Notice';
import useDatabases from 'src/hooks/useDatabases';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';
import { initWindows } from 'src/utilities/initWindows';
import useTimezone from 'src/utilities/useTimezone';

const useStyles = makeStyles((theme: Theme) => ({
  maintenanceWrapper: {
    display: 'flex'
  },
  chooseDay: {
    marginTop: 0,
    marginRight: theme.spacing(2),
    minWidth: 150
  },
  chooseTime: {
    marginTop: 0,
    minWidth: 270
  },
  timeHelperText: {
    fontSize: '0.875em'
  }
}));

interface Props {
  databaseID: number;
  databaseMaintenanceSchedule: DatabaseMaintenanceSchedule;
}

type CombinedProps = Props;

export const DatabaseSettingsMaintenancePanel: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const timezone = useTimezone();
  const { updateDatabase } = useDatabases();

  const { databaseID, databaseMaintenanceSchedule } = props;

  const [maintenanceDay, setMaintenanceDay] = React.useState<string | number>(
    databaseMaintenanceSchedule.day
  );
  const [maintenanceTime, setMaintenanceTime] = React.useState<string | number>(
    databaseMaintenanceSchedule.window
  );
  const [open, setOpen] = React.useState<boolean>(false);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [success, setSuccess] = React.useState<string | undefined>(undefined);
  const [errors, setErrors] = React.useState<APIError[] | undefined>();

  React.useEffect(() => {
    if (open) {
      setSuccess('');
    }
  }, [open]);

  const errorMap = getErrorMap(
    ['maintenance_schedule.day', 'maintenance_schedule.window'],
    errors
  );
  const dayError = errorMap['maintenance_schedule.day'];
  const windowError = errorMap['maintenance_schedule.window'];
  const genericError = errorMap.none;

  const structureOptionsForSelect = (optionsData: string[][]) => {
    return optionsData.map((option: string[]) => {
      const label = option[0];
      return { label, value: option[1] };
    });
  };

  // Maintenance Day
  const daySelection = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ].map(thisDay => ({
    label: thisDay,
    value: thisDay
  }));

  const defaultDaySelection = daySelection.find(eachOption => {
    return eachOption.value === maintenanceDay;
  });

  const handleDaySelection = (item: Item) => {
    if (item) {
      setMaintenanceDay(item.value);
    } else {
      setMaintenanceDay('');
    }
  };

  // Maintenance Window
  const maintenanceWindowSelectOptions = initWindows(timezone);
  const maintenanceWindowHelperText =
    'Select the time of day you’d prefer maintenance to occur. On Standard Availability plans, there may be downtime during this window.';
  const windowSelection = structureOptionsForSelect(
    maintenanceWindowSelectOptions
  );

  const defaultTimeSelection = windowSelection.find(eachOption => {
    return eachOption.value === maintenanceTime;
  });

  const handleWindowSelection = (item: Item) => {
    if (item) {
      setMaintenanceTime(item.value);
    } else {
      setMaintenanceTime('');
    }
  };

  const changeMaintenanceWindow = () => {
    setSubmitting(true);
    setSuccess(undefined);
    setErrors(undefined);

    const maintenanceSchedule = {
      day: maintenanceDay as DatabaseMaintenanceSchedule['day'],
      window: maintenanceTime as DatabaseMaintenanceSchedule['window']
    };

    updateDatabase(databaseID, {
      maintenance_schedule: maintenanceSchedule
    })
      .then(() => {
        setSubmitting(false);
        setSuccess('Maintenance window changed successfully.');
      })
      .catch(error => {
        setSubmitting(false);
        setErrors(
          getAPIErrorOrDefault(
            error,
            'An error occurred while updating the maintenance window.'
          )
        );
      });
  };

  return (
    <ExpansionPanel
      heading="Change Maintenance Window"
      expanded={open}
      onChange={() => {
        setOpen(!open);
      }}
      success={success}
      actions={() => (
        <ActionsPanel>
          <Button
            onClick={changeMaintenanceWindow}
            buttonType="primary"
            disabled={submitting}
            loading={submitting}
            data-qa-label-save
          >
            Save
          </Button>
        </ActionsPanel>
      )}
    >
      {genericError && <Notice error text={genericError} />}
      <FormHelperText style={{ maxWidth: 'none' }}>
        {maintenanceWindowHelperText}
      </FormHelperText>
      <div className={classes.maintenanceWrapper}>
        <FormControl className={classes.chooseDay}>
          <Select
            name="maintenanceDay"
            id="maintenanceDay"
            label="Day of Week"
            errorText={dayError}
            onChange={handleDaySelection}
            options={daySelection}
            placeholder="Choose a day"
            value={defaultDaySelection}
            isClearable={false}
            data-qa-item="maintenanceDay"
          />
        </FormControl>
        <FormControl className={classes.chooseTime}>
          <Select
            name="maintenanceWindow"
            id="maintenanceWindow"
            label="Time of Day"
            errorText={windowError}
            onChange={handleWindowSelection}
            options={windowSelection}
            placeholder="Choose a time"
            value={defaultTimeSelection}
            isClearable={false}
            data-qa-item="maintenanceWindow"
          />
          <FormHelperText className={classes.timeHelperText}>
            Time displayed in {timezone.replace('_', ' ')}
          </FormHelperText>
        </FormControl>
      </div>
    </ExpansionPanel>
  );
};

export default DatabaseSettingsMaintenancePanel;
