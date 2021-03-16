import { Interface } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import { useFormik } from 'formik';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import InterfaceSelect from '../LinodesDetail/LinodeSettings/InterfaceSelect';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingBottom: theme.spacing(3),
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
}));

interface Props {}

type CombinedProps = Props;

const defaultInterface = {
  purpose: 'vlan',
  label: '',
  ipam_address: '',
};

interface EditableFields {
  label: string;
  ipam_address?: string;
}

const AttachVLAN: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const { values, setFieldValue, ...formik } = useFormik({
    initialValues: defaultInterface,
    validateOnChange: true,
    validateOnMount: true,
    onSubmit: (values) => onSubmit(values),
  });

  const handleInterfaceChange = React.useCallback(
    (slot: number, updatedInterface: Interface) => {
      setFieldValue(`interfaces[${slot}]`, updatedInterface);
    },
    [setFieldValue]
  );

  const onSubmit = (values: EditableFields) => {
    // const { linodeConfigId, createLinodeConfig, updateLinodeConfig } = props;

    formik.setSubmitting(true);

    // const configData = convertStateToData(values);
    const data = values;

    alert(JSON.stringify(values));

    const handleSuccess = () => {
      formik.setSubmitting(false);
      console.log('VLAN attached successfully');
    };

    const handleError = (error: APIError[]) => {
      const mapErrorToStatus = (generalError: string) =>
        formik.setStatus({ generalError });
      formik.setSubmitting(false);
      handleFieldErrors(formik.setErrors, error);
      handleGeneralErrors(
        mapErrorToStatus,
        error,
        'An unexpected error occurred.'
      );
      // scrollErrorIntoView('linode-config-dialog');
    };

    /** Creating */
    // return createLinodeConfig(configData)
    //   .then(handleSuccess)
    //   .catch(handleError);
  };

  return (
    <div className={classes.root}>
      <Typography variant="h2" className={classes.title}>
        Attach a VLAN
      </Typography>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="body1">
            Helper text about VLANs.... eth0 is attached to the public Internet.
            eth1 will be automatically assigned to it and editing can happen
            from the Configurations tab
          </Typography>
          <InterfaceSelect
            slotNumber={1}
            readOnly={false}
            error={formik.errors[`interfaces[1]`]}
            label={values.label}
            purpose="vlan"
            ipamAddress={values.ipam_address}
            handleChange={(newInterface: Interface) =>
              handleInterfaceChange(1, newInterface)
            }
            fromAddonsPanel
          />
        </Grid>
      </Grid>
      <ActionsPanel className={classes.actions}>
        <Button
          disabled={formik.isSubmitting}
          onClick={() => console.log('Cancel Attach VLAN')}
          loading={formik.isSubmitting}
          buttonType="cancel"
        >
          Cancel
        </Button>
        <Button
          onClick={formik.submitForm}
          loading={formik.isSubmitting}
          buttonType="primary"
        >
          Attach VLAN
        </Button>
      </ActionsPanel>
    </div>
  );
};

export default React.memo(AttachVLAN);
