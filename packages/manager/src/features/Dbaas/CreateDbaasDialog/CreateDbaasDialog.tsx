import createDatabaseSchema from '@linode/api-v4/lib/databases/databases.schema';
import { CreateDatabasePayload } from '@linode/api-v4/lib/databases/types';
import { useFormik } from 'formik';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Dialog from 'src/components/Dialog';
import RegionSelect, {
  ExtendedRegion
} from 'src/components/EnhancedSelect/variants/RegionSelect';
import Notice from 'src/components/Notice';
import TagsInput from 'src/components/TagsInput';
import TextField from 'src/components/TextField';
import { dcDisplayNames } from 'src/constants';
import { dbaasContext } from 'src/context';
import useRegions from 'src/hooks/useRegions';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import FormHelperText from 'src/components/core/FormHelperText';
import FormControl from 'src/components/core/FormControl';
import Typography from 'src/components/core/Typography';
import SelectDBPlanPanel from './SelectDBPlanPanel';
import { useReduxLoad } from 'src/hooks/useReduxLoad';
import { useDatabaseTypes } from 'src/hooks/useDatabaseTypes';

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

  const regionsWithDbaas: ExtendedRegion[] = regions.entities
    //   .filter(thisRegion => thisRegion.capabilities.includes('Databases')) // temporarily commented out until Capabilities is squared away
    .map(r => ({ ...r, display: dcDisplayNames[r.id] }));

  const handleRegionSelect = (regionID: string) => {
    formik.setFieldValue('region', regionID);
  };

  const maintenanceDayOptions = [
    ['Sunday', 'Sunday'],
    ['Monday', 'Monday'],
    ['Tuesday', 'Tuesday'],
    ['Wednesday', 'Wednesday'],
    ['Thursday', 'Thursday'],
    ['Friday', 'Friday'],
    ['Saturday', 'Saturday']
  ];
  const maintenanceWindowSelectOptions: Item[] = [];
  const maintenanceWindowHelperText =
    'Select the time of day you’d prefer maintenance to occur. On Standard Availability plans, there may be downtime during this window.';

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
        day: '',
        window: ''
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

    if (!payload.maintenance_schedule) {
      payload.maintenance_schedule = undefined;
    }

    if (!payload.tags) {
      payload.tags = undefined;
    }

    // createDbaas(payload)
    //   .then(response => {
    //     formik.setSubmitting(false);
    //     context.close();
    //     history.push('/databases');
    //   })
    //   .catch(err => {
    //     const mapErrorToStatus = (generalError: string) =>
    //       formik.setStatus({ generalError });

    //     formik.setSubmitting(false);
    //     handleFieldErrors(formik.setErrors, err);
    //     handleGeneralErrors(
    //       mapErrorToStatus,
    //       err,
    //       'An unexpected error occurred.'
    //     );
    //   });
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
            placeholder={''}
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
        />
        <PasswordInput
          name="password"
          label="Root Password"
          type="password"
          data-qa-add-password
          value={formik.values.root_password}
          error={!!formik.errors.root_password}
          errorText={formik.errors.root_password}
          onChange={handlePasswordChange}
          hideValidation
          required
        />
        <div
          className={classes.formSection}
          data-testid="maintenance-window-selects"
        >
          <Typography variant="h3">Maintenance Window</Typography>
          <FormHelperText>{maintenanceWindowHelperText}</FormHelperText>
          <FormControl className={classes.chooseDay}>
            <Select
              options={maintenanceDayOptions}
              defaultValue={maintenanceWindowSelectOptions[0]}
              onChange={}
              name="maintenanceDay"
              id="maintenanceDay"
              label="Day of Week"
              placeholder="Choose a day"
              isClearable={false}
              data-qa-item="maintenanceDay"
            />
          </FormControl>
          <FormControl className={classes.chooseTime}>
            <Select
              options={maintenanceWindowSelectOptions}
              defaultValue={maintenanceWindowSelectOptions[0]}
              onChange={}
              name="maintenanceWindow"
              id="maintenanceWindow"
              label="Time of Day"
              placeholder="Choose a time"
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
                      formik.errors.tags,
                      'Unable to tag database.'
                    )
                  : undefined
                : undefined
            }
            name="tags"
            label="Add Tags"
            onChange={selected => formik.setFieldValue('tags', selected)}
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
