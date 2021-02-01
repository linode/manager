import createDatabaseSchema from '@linode/api-v4/lib/databases/databases.schema';
import {
  CreateDatabasePayload,
  DatabaseMaintenanceSchedule
} from '@linode/api-v4/lib/databases/types';
import { APIError } from '@linode/api-v4/lib/types';
import { useFormik } from 'formik';
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
import { useRegionsQuery } from 'src/queries/regions';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import { initWindows } from 'src/utilities/initWindows';
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
  maintenanceSelectsOuter: {
    display: 'flex',
    maxWidth: '415px',
    [theme.breakpoints.down('xs')]: {
      display: 'block',
      width: '100%'
    }
  },
  maintenanceSelectsInner: {
    display: 'inline-block',
    [theme.breakpoints.down('xs')]: {
      display: 'block'
    }
  },
  chooseDay: {
    marginTop: 0,
    marginRight: theme.spacing(2),
    minWidth: 160
  },
  chooseTime: {
    marginTop: 0,
    minWidth: 240
  },
  timeHelperText: {
    fontSize: '0.875em'
  }
}));

export const CreateDatabaseDialog: React.FC<{}> = _ => {
  const context = React.useContext(dbaasContext);
  const classes = useStyles();
  const history = useHistory();
  const regions = useRegionsQuery().data ?? [];
  const timezone = useTimezone();
  const { createDatabase } = useDatabases();

  const regionsWithDatabases: ExtendedRegion[] = React.useMemo(() => {
    return (
      regions
        //   .filter(thisRegion => thisRegion.capabilities.includes('Databases')) // temporarily commented out until Capabilities is squared away
        .map(r => ({ ...r, display: dcDisplayNames[r.id] }))
    );
  }, [regions]);

  const handleRegionSelect = (regionID: string) => {
    setFieldValue('region', regionID);
  };

  const structureOptionsForSelect = (optionsData: string[][]) => {
    return optionsData.map((option: string[]) => {
      const label = option[0];
      return { label, value: option[1] };
    });
  };

  const handleDaySelection = (item: Item) => {
    setFieldValue('maintenance_schedule.day', item?.value);
  };

  // Maintenance Window
  const maintenanceWindowSelectOptions = React.useMemo(
    () => initWindows(timezone),
    [timezone]
  );
  const maintenanceWindowHelperText =
    'Select the time of day you’d prefer maintenance to occur. On Standard Availability plans, there may be downtime during this window.';
  const windowSelection = React.useMemo(
    () => structureOptionsForSelect(maintenanceWindowSelectOptions),
    [maintenanceWindowSelectOptions]
  );

  const handleWindowSelection = (item: Item) => {
    setFieldValue('maintenance_schedule.window', item?.value);
  };

  const { databaseTypes } = useDatabaseTypes();
  const { _loading } = useReduxLoad(
    ['databaseTypes'],
    undefined,
    context.isOpen
  );

  const randomNumberForDaySelection = Math.floor(
    Math.random() * (daySelection.length - 1)
  );
  const randomNumberForWindowSelection = Math.floor(Math.random() * 12);

  const { resetForm, setFieldValue, ...formik } = useFormik({
    initialValues: {
      label: '',
      region: '',
      type: '',
      root_password: '',
      tags: [] as string[],
      maintenance_schedule: {
        day: (daySelection[randomNumberForDaySelection]?.value ??
          '') as DatabaseMaintenanceSchedule['day'],
        window: (windowSelection[randomNumberForWindowSelection]?.value ??
          '') as DatabaseMaintenanceSchedule['window']
      }
    },
    validationSchema: createDatabaseSchema,
    validateOnChange: false,
    onSubmit: values => submitForm(values)
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue('root_password', e.target.value);
  };

  const handlePlanChange = React.useCallback(
    (id: string) => {
      setFieldValue('type', id);
    },
    [setFieldValue]
  );

  const handleTagChange = (selected: Item[]) => {
    const tagStrings = selected.map(selectedItem => selectedItem.value);
    setFieldValue('tags', tagStrings);
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

    if (typeof payload.maintenance_schedule !== 'undefined') {
      // The "(undefined as unknown) as..." code is to avoid "Type 'undefined' is not assignable to type..." TypeScript error
      if (!payload.maintenance_schedule.day) {
        payload.maintenance_schedule.day = (undefined as unknown) as DatabaseMaintenanceSchedule['day'];
      }
      if (!payload.maintenance_schedule.window) {
        payload.maintenance_schedule.window = (undefined as unknown) as DatabaseMaintenanceSchedule['window'];
      }
    }

    if (
      !payload.maintenance_schedule?.day &&
      !payload.maintenance_schedule?.window
    ) {
      payload.maintenance_schedule = undefined;
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
            label={'Region (required)'}
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
            selectedPlanId={formik.values.type}
            errorText={formik.errors.type}
          />
        )}
        <div className={classes.formSection}>
          <PasswordInput
            name="password"
            label="MySQL Password"
            type="password"
            data-qa-add-password
            value={formik.values.root_password}
            error={!!formik.errors.root_password}
            errorText={formik.errors.root_password}
            onChange={handlePasswordChange}
            required
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
          <div className={classes.maintenanceSelectsOuter}>
            <div className={classes.maintenanceSelectsInner}>
              <FormControl className={classes.chooseDay}>
                <Select
                  options={daySelection}
                  value={daySelection.find(
                    day => day.value === formik.values.maintenance_schedule.day
                  )}
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
            </div>
            <div className={classes.maintenanceSelectsInner}>
              <FormControl className={classes.chooseTime}>
                <Select
                  options={windowSelection}
                  value={windowSelection.find(
                    window =>
                      window.value === formik.values.maintenance_schedule.window
                  )}
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

              <FormHelperText className={classes.timeHelperText}>
                Time displayed in {timezone.replace('_', ' ')}
              </FormHelperText>
            </div>
          </div>
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
