import * as React from 'react';
import { useFormik } from 'formik';
import Dialog from 'src/components/Dialog';
import { dbaasContext } from 'src/context';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

import createDatabaseSchema from '@linode/api-v4/lib/databases/databases.schema';
import {
  DatabaseMaintenanceSchedule,
  CreateDatabasePayload
} from '@linode/api-v4/lib/databases/types';

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

    // createDbaas(payload).then().catch(err => {});
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
      {/*
        Input for label

        Select dropdown for region

        Database plans

        Password field

        Select dropdown for maintenance window

        Select dropdown for adding tags
    */}
    </Dialog>
  );
};

export default React.memo(CreateDbaasDialog);
