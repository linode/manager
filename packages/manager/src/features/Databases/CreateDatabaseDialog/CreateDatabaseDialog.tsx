import createDatabaseSchema from '@linode/api-v4/lib/databases/databases.schema';
import {
  CreateDatabasePayload,
  DatabaseMaintenanceSchedule
} from '@linode/api-v4/lib/databases/types';
import { APIError } from '@linode/api-v4/lib/types';
import { useFormik } from 'formik';
import { DateTime } from 'luxon';
import { sortBy } from 'ramda';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import FormControl from 'src/components/core/FormControl';
import FormHelperText from 'src/components/core/FormHelperText';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Dialog from 'src/components/Dialog';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import RegionSelect, {
  ExtendedRegion
} from 'src/components/EnhancedSelect/variants/RegionSelect';
import Notice from 'src/components/Notice';
import TagsInput from 'src/components/TagsInput';
import TextField from 'src/components/TextField';
import { dcDisplayNames } from 'src/constants';
import { dbaasContext } from 'src/context';
import useDatabases from 'src/hooks/useDatabases';
import { useDatabaseTypes } from 'src/hooks/useDatabaseTypes';
import { useReduxLoad } from 'src/hooks/useReduxLoad';
import useRegions from 'src/hooks/useRegions';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import { evenizeNumber } from 'src/utilities/evenizeNumber';
import {
  handleFieldErrors,
  handleGeneralErrors
} from 'src/utilities/formikErrorUtils';
import useTimezone from 'src/utilities/useTimezone';
import SelectDBPlanPanel from './SelectDBPlanPanel';

const PasswordInput = React.lazy(() => import('src/components/PasswordInput'));

const useStyles = makeStyles((theme: Theme) => ({
  form: {},
  formSection: {
    marginBottom: theme.spacing(3)
  },
  chooseDay: {
    marginRight: theme.spacing(2),
    midWidth: 150
  },
  chooseTime: {
    marginRight: theme.spacing(2),
    midWidth: 150
  }
}));

export const CreateDatabaseDialog: React.FC<{}> = _ => {
  const context = React.useContext(dbaasContext);
  const classes = useStyles();
  const history = useHistory();
  const regions = useRegions();
  const timezone = useTimezone();
  const { createDatabase } = useDatabases();

  const regionsWithDatabases: ExtendedRegion[] = regions.entities
    //   .filter(thisRegion => thisRegion.capabilities.includes('Databases')) // temporarily commented out until Capabilities is squared away
    .map(r => ({ ...r, display: dcDisplayNames[r.id] }));

  const handleRegionSelect = (regionID: string) => {
    formik.setFieldValue('region', regionID);
  };

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

  const handleDaySelection = (item: Item) => {
    if (item) {
      formik.setFieldValue('maintenance_schedule.day', item.value);
    } else {
      formik.setFieldValue('maintenance_schedule.day', undefined);
    }
  };

  // Maintenance Window
  const initWindows = (timezone: string) => {
    let windows = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22].map(hour => {
      const start = DateTime.fromObject({ hour, zone: 'utc' }).setZone(
        timezone
      );
      const finish = start.plus({ hours: 2 });
      return [
        `${start.toFormat('HH:mm')} - ${finish.toFormat('HH:mm')}`,
        `W${evenizeNumber(start.setZone('utc').hour)}`
      ];
    });

    windows = sortBy<string[]>(window => window[0], windows);

    return windows;
  };

  const maintenanceWindowSelectOptions = initWindows(timezone);
  const maintenanceWindowHelperText =
    'Select the time of day you’d prefer maintenance to occur. On Standard Availability plans, there may be downtime during this window.';
  const windowSelection = structureOptionsForSelect(
    maintenanceWindowSelectOptions
  );

  const handleWindowSelection = (item: Item) => {
    if (item) {
      formik.setFieldValue('maintenance_schedule.window', item.value);
    } else {
      formik.setFieldValue('maintenance_schedule.window', undefined);
    }
  };

  const { databaseTypes } = useDatabaseTypes();
  const { _loading } = useReduxLoad(
    ['databaseTypes'],
    undefined,
    context.isOpen
  );

  const [selectedPlanId, setSelectedPlanId] = React.useState<string>('');

  const { resetForm, ...formik } = useFormik({
    initialValues: {
      label: '',
      region: '',
      type: '',
      root_password: '',
      tags: [] as string[],
      maintenance_schedule: {
        day: '' as DatabaseMaintenanceSchedule['day'],
        window: '' as DatabaseMaintenanceSchedule['window']
      }
    },
    validationSchema: createDatabaseSchema,
    validateOnChange: false,
    onSubmit: values => submitForm(values)
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    formik.setFieldValue('root_password', e.target.value);
  };

  const handlePlanChange = (id: string) => {
    setSelectedPlanId(id);
    formik.setFieldValue('type', id);
  };

  const handleTagChange = (selected: Item[]) => {
    const tagStrings = selected.map(selectedItem => selectedItem.value);
    formik.setFieldValue('tags', tagStrings);
  };

  /** Reset errors and state when the modal opens */
  React.useEffect(() => {
    if (context.isOpen) {
      resetForm();
    }
  }, [context.isOpen, resetForm]);

  const submitForm = (values: CreateDatabasePayload) => {
    const payload = { ...values };

    // Set any potentially empty non-required fields to undefined.
    if (payload.label === '') {
      payload.label = undefined;
    }

    createDatabase(payload)
      .then(_ => {
        formik.setSubmitting(false);
        context.close();
        history.push('/databases');
      })
      .catch(err => {
        const mapErrorToStatus = (generalError: string) =>
          formik.setStatus({ generalError });

        formik.setSubmitting(false);
        handleFieldErrors(formik.setErrors, err);
        handleGeneralErrors(
          mapErrorToStatus,
          err,
          'An unexpected error occurred.'
        );
      });
  };

  return (
    <Dialog
      title="Create a Database"
      open={context.isOpen}
      onClose={context.close}
      fullWidth
      fullHeight
      titleBottomBorder
      maxWidth="md"
    >
      {!!formik.status && <Notice error text={formik.status.generalError} />}
      <Typography
        variant="subtitle2"
        style={{ fontWeight: 600, marginTop: '1em' }}
      >
        Create a cloud-based MySQL database.
      </Typography>
      <form className={classes.form} onSubmit={formik.handleSubmit}>
        <div className={classes.formSection} data-testid="label-input">
          <TextField
            label="Label"
            name="label"
            value={formik.values.label}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            errorText={formik.touched.label ? formik.errors.label : undefined}
            data-testid="label"
          />
        </div>
        <div className={classes.formSection} data-testid="region-select">
          <RegionSelect
            label={'Region'}
            placeholder={' '}
            errorText={formik.errors.region}
            handleSelection={handleRegionSelect}
            regions={regionsWithDatabases}
            selectedID={formik.values.region}
          />
        </div>
        {_loading ? (
          <CircleProgress />
        ) : (
          <SelectDBPlanPanel
            databasePlans={databaseTypes.data ?? []}
            onPlanSelect={handlePlanChange}
            selectedPlanId={selectedPlanId}
            errorText={formik.errors.type}
          />
        )}
        <div className={classes.formSection}>
          <PasswordInput
            name="password"
            label="Root Password"
            type="password"
            data-qa-add-password
            value={formik.values.root_password}
            error={!!formik.errors.root_password}
            errorText={formik.errors.root_password}
            onChange={handlePasswordChange}
          />
        </div>
        <div
          className={classes.formSection}
          data-testid="maintenance-window-selects"
        >
          <Typography variant="h3">Maintenance Window</Typography>
          <FormHelperText style={{ maxWidth: 'none' }}>
            {maintenanceWindowHelperText}
          </FormHelperText>
          <FormControl fullWidth className={classes.chooseDay}>
            <Select
              options={daySelection}
              onChange={handleDaySelection}
              name="maintenanceDay"
              id="maintenanceDay"
              label="Day of Week"
              placeholder="Choose a day"
              errorText={formik.errors['maintenance_schedule.day']}
              isClearable={true}
              data-qa-item="maintenanceDay"
            />
          </FormControl>
          <FormControl fullWidth className={classes.chooseTime}>
            <Select
              options={windowSelection}
              onChange={handleWindowSelection}
              name="maintenanceWindow"
              id="maintenanceWindow"
              label="Time of Day"
              placeholder="Choose a time"
              errorText={formik.errors['maintenance_schedule.window']}
              isClearable={true}
              data-qa-item="maintenanceWindow"
            />
          </FormControl>
        </div>
        <div className={classes.formSection} data-testid="label-input">
          <TagsInput
            tagError={
              formik.touched.tags
                ? formik.errors.tags
                  ? getErrorStringOrDefault(
                      formik.errors.tags as string | APIError[],
                      'Unable to tag database.'
                    )
                  : undefined
                : undefined
            }
            name="tags"
            label="Add Tags"
            onChange={handleTagChange}
            value={formik.values.tags.map(tagString => ({
              label: tagString,
              value: tagString
            }))}
          />
        </div>
        <Button
          onClick={() => formik.handleSubmit()}
          buttonType="primary"
          loading={formik.isSubmitting}
          data-testid="submit-vlan-form"
        >
          Create Database
        </Button>
      </form>
    </Dialog>
  );
};

export default React.memo(CreateDatabaseDialog);
