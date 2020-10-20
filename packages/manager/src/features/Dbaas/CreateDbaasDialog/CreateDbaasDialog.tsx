import * as React from 'react';
import { useFormik } from 'formik';
import { useHistory } from 'react-router-dom';

import Dialog from 'src/components/Dialog';
import { dbaasContext } from 'src/context';
import { makeStyles, Theme } from 'src/components/core/styles';
import Button from 'src/components/Button';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';

import createDatabaseSchema from '@linode/api-v4/lib/databases/databases.schema';
import {
  DatabaseMaintenanceSchedule,
  CreateDatabasePayload
} from '@linode/api-v4/lib/databases/types';

import {
  handleFieldErrors,
  handleGeneralErrors
} from 'src/utilities/formikErrorUtils';

const useStyles = makeStyles((theme: Theme) => ({
  form: {},
  formSection: {
    marginBottom: theme.spacing(3)
  },
  helperText: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(),
    lineHeight: 1.5,
    fontSize: '1rem'
  }
}));

export const CreateDbaasDialog: React.FC<{}> = _ => {
  const context = React.useContext(dbaasContext);
  const classes = useStyles();
  const history = useHistory();

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
        {/*
        Select dropdown for region

        Database plans

        Password field

        Select dropdown for maintenance window

        Select dropdown for adding tags
    */}
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
