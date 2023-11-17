import { CreateRouteSchema } from '@linode/validation';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { number, object } from 'yup';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Notice } from 'src/components/Notice/Notice';
import { Radio } from 'src/components/Radio/Radio';
import { RadioGroup } from 'src/components/RadioGroup';
import { TextField } from 'src/components/TextField';
import { useLoadBalancerRouteCreateMutation } from 'src/queries/aglb/routes';
import { getFormikErrorsFromAPIErrors } from 'src/utilities/formikErrorUtils';

import { RouteSelect } from './RouteSelect';
import { ROUTE_COPY } from './constants';
import { getRouteProtocolFromConfigurationProtocol } from './utils';

import type { Configuration, CreateRoutePayload } from '@linode/api-v4';

export interface Props {
  configuration: Pick<Configuration, 'protocol'>;
  loadbalancerId: number;
  onAdd: (routeId: number) => void;
  onClose: () => void;
  open: boolean;
}

type Mode = 'existing' | 'new';

export const AddRouteDrawer = (props: Props) => {
  const { configuration, loadbalancerId, onAdd, onClose, open } = props;

  const [mode, setMode] = useState<Mode>('existing');

  const routeProtocol = getRouteProtocolFromConfigurationProtocol(
    configuration.protocol
  );

  return (
    <Drawer onClose={onClose} open={open} title="Add Route">
      {ROUTE_COPY.Description[routeProtocol]}
      <RadioGroup onChange={(_, value) => setMode(value as Mode)} value={mode}>
        <FormControlLabel
          control={<Radio />}
          label={`Create New ${routeProtocol.toUpperCase()} Route`}
          value="new"
        />
        <FormControlLabel
          control={<Radio />}
          label="Add Existing Route"
          value="existing"
        />
      </RadioGroup>
      {mode === 'existing' ? (
        <AddExistingRouteForm
          loadbalancerId={loadbalancerId}
          onAdd={onAdd}
          onClose={onClose}
        />
      ) : (
        <AddNewRouteForm
          configuration={configuration}
          loadbalancerId={loadbalancerId}
          onAdd={onAdd}
          onClose={onClose}
        />
      )}
    </Drawer>
  );
};

interface AddExistingRouteFormProps {
  loadbalancerId: number;
  onAdd: (routeId: number) => void;
  onClose: () => void;
}

const AddExistingRouteForm = (props: AddExistingRouteFormProps) => {
  const { loadbalancerId, onAdd, onClose } = props;

  const formik = useFormik<{ route: null | number }>({
    initialValues: {
      route: null,
    },
    onSubmit({ route }) {
      onAdd(route!);
      onClose();
    },
    validationSchema: object({
      route: number().required().typeError('Route is required.'),
    }),
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <RouteSelect
        errorText={formik.errors.route}
        loadbalancerId={loadbalancerId}
        onChange={(route) => formik.setFieldValue('route', route?.id ?? null)}
        value={formik.values.route ?? -1}
      />
      <ActionsPanel
        primaryButtonProps={{
          label: 'Add Route',
          type: 'submit',
        }}
        secondaryButtonProps={{
          label: 'Cancel',
          onClick: onClose,
        }}
      />
    </form>
  );
};

interface AddNewRouteFormProps {
  configuration: Pick<Configuration, 'protocol'>;
  loadbalancerId: number;
  onAdd: (routeId: number) => void;
  onClose: () => void;
}

const AddNewRouteForm = (props: AddNewRouteFormProps) => {
  const { configuration, loadbalancerId, onAdd, onClose } = props;

  const {
    error,
    isLoading,
    mutateAsync: createRoute,
  } = useLoadBalancerRouteCreateMutation(loadbalancerId);

  const formik = useFormik<CreateRoutePayload>({
    initialValues: {
      label: '',
      protocol: getRouteProtocolFromConfigurationProtocol(
        configuration.protocol
      ),
      rules: [],
    },
    async onSubmit(values, helpers) {
      try {
        const route = await createRoute(values);
        onAdd(route.id);
        onClose();
      } catch (error) {
        helpers.setErrors(getFormikErrorsFromAPIErrors(error));
      }
    },
    validationSchema: CreateRouteSchema,
  });

  const generalErrors = error
    ?.filter((e) => !e.field || e.field !== 'label')
    .map((e) => e.reason)
    .join(',');

  return (
    <form onSubmit={formik.handleSubmit}>
      {generalErrors && <Notice text={generalErrors} variant="error" />}
      <TextField
        errorText={formik.errors.label}
        label="Route Label"
        name="label"
        noMarginTop
        onChange={formik.handleChange}
        value={formik.values.label}
      />
      <ActionsPanel
        primaryButtonProps={{
          label: 'Create Route',
          loading: isLoading,
          type: 'submit',
        }}
        secondaryButtonProps={{
          label: 'Cancel',
          onClick: onClose,
        }}
      />
    </form>
  );
};
