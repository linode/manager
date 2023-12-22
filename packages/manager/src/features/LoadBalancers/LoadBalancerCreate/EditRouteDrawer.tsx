import { RoutePayload } from '@linode/api-v4';
import { UpdateRouteSchema } from '@linode/validation';
import { useFormik, useFormikContext, yupToFormErrors } from 'formik';
import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { TextField } from 'src/components/TextField';

import { LoadBalancerCreateFormData } from './LoadBalancerCreateFormWrapper';

interface Props {
  configurationIndex: number;
  onClose: () => void;
  open: boolean;
  routeIndex: number | undefined;
}

export const EditRouteDrawer = (props: Props) => {
  const { configurationIndex, onClose: _onClose, open, routeIndex } = props;

  const {
    setFieldValue,
    values,
  } = useFormikContext<LoadBalancerCreateFormData>();

  const allOtherRoutes = values.configurations.reduce<RoutePayload[]>(
    (acc, configuration, configIndex) => {
      const otherRoutes = configuration.routes!.filter((r, index) => {
        // Exclude this route
        if (configIndex === configurationIndex && index === routeIndex) {
          return false;
        }
        return true;
      });
      return [...acc, ...otherRoutes];
    },
    []
  );

  const formik = useFormik<RoutePayload>({
    enableReinitialize: true,
    initialValues:
      routeIndex !== undefined &&
      routeIndex >= 0 &&
      routeIndex < values.configurations![configurationIndex].routes!.length
        ? values.configurations![configurationIndex].routes![routeIndex]
        : { label: '', protocol: 'http', rules: [] },
    onSubmit(route) {
      setFieldValue(
        `configurations[${configurationIndex}].routes[${routeIndex}]`,
        route
      );
      onClose();
    },
    validate(values) {
      if (allOtherRoutes.some((route) => route.label === values.label)) {
        return {
          label: 'Routes must have unique labels across all configurations.',
        };
      }
      // We must use `validate` insted of validationSchema because Formik decided to convert
      // "" to undefined before passing the values to yup. This makes it hard to validate `label`.
      // See https://github.com/jaredpalmer/formik/issues/805
      try {
        UpdateRouteSchema.validateSync(values, { abortEarly: false });
        return {};
      } catch (error) {
        return yupToFormErrors(error);
      }
    },
  });

  const onClose = () => {
    _onClose();
    formik.resetForm();
  };

  return (
    <Drawer onClose={onClose} open={open} title="Edit Route">
      <form onSubmit={formik.handleSubmit}>
        <TextField
          errorText={formik.errors.label}
          label="Route Label"
          name="label"
          onChange={formik.handleChange}
          value={formik.values.label}
        />
        <ActionsPanel
          primaryButtonProps={{
            disabled: !formik.dirty,
            label: 'Save',
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
