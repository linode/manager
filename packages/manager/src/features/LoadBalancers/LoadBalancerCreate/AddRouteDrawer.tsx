import { CreateRouteSchema } from '@linode/validation';
import { useFormik, useFormikContext, yupToFormErrors } from 'formik';
import React, { useState } from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Drawer } from 'src/components/Drawer';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Radio } from 'src/components/Radio/Radio';
import { RadioGroup } from 'src/components/RadioGroup';
import { Stack } from 'src/components/Stack';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';

import { ROUTE_COPY } from '../LoadBalancerDetail/Routes/constants';
import { getRouteProtocolFromConfigurationProtocol } from '../LoadBalancerDetail/Routes/utils';
import { LoadBalancerCreateFormData } from './LoadBalancerCreate';

import type { Configuration, Route, RoutePayload } from '@linode/api-v4';

export interface Props {
  configurationIndex: number;
  onClose: () => void;
  open: boolean;
  protocol: Configuration['protocol'];
}

type Mode = 'existing' | 'new';

export const AddRouteDrawer = (props: Props) => {
  const { configurationIndex, onClose, open, protocol } = props;

  const {
    setFieldValue,
    values,
  } = useFormikContext<LoadBalancerCreateFormData>();

  const [mode, setMode] = useState<Mode>('new');

  const routeProtocol = getRouteProtocolFromConfigurationProtocol(protocol);

  const existingRoutesInThisConfiguration = values.configurations![
    configurationIndex
  ].routes!;

  const onAdd = (route: RoutePayload) => {
    setFieldValue(`configurations[${configurationIndex}].routes`, [
      ...values.configurations![configurationIndex].routes!,
      route,
    ]);
    onClose();
  };

  return (
    <Drawer onClose={onClose} open={open} title="Add Route">
      <Stack spacing={1}>
        <Typography>{ROUTE_COPY.Description.main}</Typography>
        <Typography>{ROUTE_COPY.Description[routeProtocol]}</Typography>
      </Stack>
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
          existingRoutes={existingRoutesInThisConfiguration}
          onAdd={onAdd}
          onClose={onClose}
        />
      ) : (
        <AddNewRouteForm
          existingRoutes={existingRoutesInThisConfiguration}
          onAdd={onAdd}
          onClose={onClose}
          protocol={routeProtocol}
        />
      )}
    </Drawer>
  );
};

interface AddExistingRouteFormProps {
  existingRoutes: RoutePayload[];
  onAdd: (route: RoutePayload) => void;
  onClose: () => void;
}

interface RouteWithConfig extends RoutePayload {
  configurationIndex: number;
}

const AddExistingRouteForm = (props: AddExistingRouteFormProps) => {
  const { existingRoutes, onAdd, onClose } = props;

  const { values } = useFormikContext<LoadBalancerCreateFormData>();

  const allRoutesAcrossConfurations = values.configurations!.reduce<
    RouteWithConfig[]
  >((acc, configuration, index) => {
    return [
      ...acc,
      ...configuration.routes!.map((r) => ({
        ...r,
        configurationIndex: index,
      })),
    ];
  }, []);

  const formik = useFormik<{ route: RoutePayload | null }>({
    initialValues: {
      route: null,
    },
    onSubmit({ route }) {
      if (!route) {
        throw new Error('No route selected');
      }
      const hasRouteWithSameLabelInConfigration = existingRoutes.some(
        (r) => r.label === route.label
      );
      if (hasRouteWithSameLabelInConfigration) {
        onAdd({
          ...route,
          label: `${route.label}-clone`,
        });
      } else {
        onAdd(route);
      }
      onClose();
    },
    validate(values) {
      if (!values.route) {
        return { route: 'Please select an existing route.' };
      }
      return {};
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Autocomplete
        getOptionLabel={(option) =>
          `${option.label} (Configuration ${
            values.configurations![option.configurationIndex].label
              ? values.configurations![option.configurationIndex].label
              : option.configurationIndex
          })`
        }
        errorText={formik.errors.route}
        label="Route"
        noMarginTop
        onChange={(_, route) => formik.setFieldValue('route', route)}
        options={allRoutesAcrossConfurations}
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
  existingRoutes: RoutePayload[];
  onAdd: (route: RoutePayload) => void;
  onClose: () => void;
  protocol: Route['protocol'];
}

const AddNewRouteForm = (props: AddNewRouteFormProps) => {
  const { existingRoutes, onAdd, onClose, protocol } = props;

  const formik = useFormik<RoutePayload>({
    initialValues: {
      label: '',
      protocol,
      rules: [],
    },
    async onSubmit(route) {
      onAdd(route);
    },
    validate(values) {
      if (existingRoutes.some((route) => route.label === values.label)) {
        return {
          label: 'Routes must have unique labels within each configuration.',
        };
      }

      try {
        CreateRouteSchema.validateSync(values, { abortEarly: false });
        return {};
      } catch (error) {
        return yupToFormErrors(error);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
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
