import { createDatabase } from '@linode/api-v4/lib/databases';
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
import { useDatabaseTypes } from 'src/hooks/useDatabaseTypes';
import useProfile from 'src/hooks/useProfile';
import { useReduxLoad } from 'src/hooks/useReduxLoad';
import useRegions from 'src/hooks/useRegions';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import { evenizeNumber } from 'src/utilities/evenizeNumber';
import {
  handleFieldErrors,
  handleGeneralErrors
} from 'src/utilities/formikErrorUtils';
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

export const CreateDbaasDialog: React.FC<{}> = _ => {
  const context = React.useContext(dbaasContext);
  const classes = useStyles();
  const history = useHistory();
  const regions = useRegions();
  const { profile } = useProfile();

  const regionsWithDbaas: ExtendedRegion[] = regions.entities
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
  const maintenanceDayOptions = [
    ['Sunday', 'Sunday'],
    ['Monday', 'Monday'],
    ['Tuesday', 'Tuesday'],
    ['Wednesday', 'Wednesday'],
    ['Thursday', 'Thursday'],
    ['Friday', 'Friday'],
    ['Saturday', 'Saturday']
  ];
  const daySelection = structureOptionsForSelect(maintenanceDayOptions);

  const handleDaySelection = (e: Item) => {
    formik.setFieldValue('maintenance_schedule.day', e.value);
  };

  // Maintenance Window
  const userTimezone = profile.data?.timezone ?? 'GMT';
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

  const maintenanceWindowSelectOptions = initWindows(userTimezone);
  const maintenanceWindowHelperText =
    'Select the time of day you’d prefer maintenance to occur. On Standard Availability plans, there may be downtime during this window.';
  const windowSelection = structureOptionsForSelect(
    maintenanceWindowSelectOptions
  );

  const handleWindowSelection = (e: Item) => {
    formik.setFieldValue('maintenance_schedule.window', e.value);
  };

  const { databaseTypes, requestDatabaseTypes } = useDatabaseTypes();
  const { _loading } = useReduxLoad(
    ['databaseTypes'],
    undefined,
    context.isOpen
  );

  const [selectedPlanId, setSelectedPlanId] = React.useState<string>('');

  React.useEffect(() => {
    if (!_loading && databaseTypes.lastUpdated === 0) {
      requestDatabaseTypes();
    }
  });

  const { resetForm, ...formik } = useFormik({
    initialValues: {
      label: '',
      region: '',
      type: '',
      root_password: '',
      tags: [''],
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

  const handleTagChange = (tag: any) => {
    if (typeof tag === 'object') {
      formik.setFieldValue('tags', tag.value);
    }
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
    // if (payload.label === '') {
    //   payload.label = undefined;
    // }

    if (!payload.maintenance_schedule) {
      payload.maintenance_schedule = undefined;
    }

    // if (isEmpty(payload.tags)) {
    //   payload.tags = undefined;
    // }

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
      maxWidth="md"
    >
      {!!formik.status && <Notice error text={formik.status.generalError} />}
      <Typography variant="subtitle2" style={{ fontWeight: 600 }}>
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
            regions={regionsWithDbaas}
            selectedID={formik.values.region}
          />
        </div>
        <SelectDBPlanPanel
          databasePlans={databaseTypes.data ?? []}
          onPlanSelect={handlePlanChange}
          selectedPlanId={selectedPlanId}
          errorText={formik.errors.type}
        />
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
              errorText={formik.errors.maintenance_schedule?.day}
              isClearable={false}
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
              errorText={formik.errors.maintenance_schedule?.window}
              isClearable={false}
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
            value={formik.values.tags}
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

export default React.memo(CreateDbaasDialog);
