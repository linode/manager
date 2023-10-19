import { CreateRoutePayload } from '@linode/api-v4';
import { useFormik } from 'formik';
import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { FormHelperText } from 'src/components/FormHelperText';
import { FormLabel } from 'src/components/FormLabel';
import { Notice } from 'src/components/Notice/Notice';
import { Radio } from 'src/components/Radio/Radio';
import { RadioGroup } from 'src/components/RadioGroup';
import { TextField } from 'src/components/TextField';
import { useLoadBalancerRouteCreateMutation } from 'src/queries/aglb/routes';
import { capitalize } from 'src/utilities/capitalize';
import { getFormikErrorsFromAPIErrors } from 'src/utilities/formikErrorUtils';
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';

interface Props {
  loadbalancerId: number;
  onClose: () => void;
  open: boolean;
}

const initialValues: CreateRoutePayload = {
  label: '',
  protocol: 'http',
  rules: [],
};

export const CreateRouteDrawer = (props: Props) => {
  const { loadbalancerId, onClose: _onClose, open } = props;

  const {
    error,
    mutateAsync: createRoute,
    reset,
  } = useLoadBalancerRouteCreateMutation(loadbalancerId);

  const formik = useFormik<CreateRoutePayload>({
    initialValues,
    async onSubmit(values) {
      try {
        await createRoute(values);
        onClose();
      } catch (errors) {
        scrollErrorIntoView();
        formik.setErrors(getFormikErrorsFromAPIErrors(errors));
      }
    },
  });

  const onClose = () => {
    formik.resetForm();
    reset();
    _onClose();
  };

  const generalError = error?.find((e) => !e.field)?.reason;

  return (
    <Drawer onClose={onClose} open={open} title="Create Route">
      <form onSubmit={formik.handleSubmit}>
        {generalError && <Notice text={generalError} variant="error" />}
        <TextField
          errorText={formik.touched.label ? formik.errors.label : undefined}
          label="Route Label"
          name="label"
          onChange={formik.handleChange}
          value={formik.values.label}
        />
        <RadioGroup
          onChange={(_, value) => formik.setFieldValue('protocol', value)}
          value={formik.values.protocol}
        >
          <FormLabel sx={(theme) => ({ marginTop: theme.spacing(1) })}>
            Protocol
          </FormLabel>
          <FormControlLabel
            control={<Radio />}
            data-qa-radio={'HTTP'}
            label="HTTP"
            value="http"
          />
          <FormControlLabel
            control={<Radio />}
            data-qa-radio={'TCP'}
            label="TCP"
            value="tcp"
          />
          <FormHelperText error>
            {formik.touched.protocol
              ? typeof formik.errors.protocol === 'string'
                ? capitalize(formik.errors.protocol)
                : undefined
              : undefined}
          </FormHelperText>
        </RadioGroup>
        <ActionsPanel
          primaryButtonProps={{
            label: 'Create Route',
            loading: formik.isSubmitting,
            type: 'submit',
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: onClose,
          }}
        />
      </form>
    </Drawer>
  );
};
