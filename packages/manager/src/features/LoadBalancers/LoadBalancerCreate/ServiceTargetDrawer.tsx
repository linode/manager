import { ServiceTargetPayload } from '@linode/api-v4';
import { useFormik } from 'formik';
import { useFormikContext } from 'formik';
import React, { useState } from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Drawer } from 'src/components/Drawer';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Radio } from 'src/components/Radio/Radio';
import { RadioGroup } from 'src/components/RadioGroup';
import { Typography } from 'src/components/Typography';
import { getNextLabel } from 'src/utilities/stringUtils';

import { SERVICE_TARGET_COPY } from '../LoadBalancerDetail/ServiceTargets/constants';
import { LoadBalancerCreateFormData } from './LoadBalancerCreateFormWrapper';
import { ServiceTargetForm } from './ServiceTargetForm';

interface Props {
  configurationIndex: number;
  onClose: () => void;
  open: boolean;
  serviceTargetIndex: number | undefined;
}

type Mode = 'existing' | 'new';

export const ServiceTargetDrawer = (props: Props) => {
  const { configurationIndex, onClose, open, serviceTargetIndex } = props;

  const [mode, setMode] = useState<Mode>('new');

  const isEditMode = serviceTargetIndex !== undefined;

  return (
    <Drawer
      onClose={onClose}
      open={open}
      title={isEditMode ? 'Edit Service Target' : 'Add a Service Target'}
    >
      <Typography>{SERVICE_TARGET_COPY.Description}</Typography>
      {!isEditMode && (
        <RadioGroup
          onChange={(_, value) => setMode(value as Mode)}
          value={mode}
        >
          <FormControlLabel
            control={<Radio />}
            label={`Create New Service Target`}
            value="new"
          />
          <FormControlLabel
            control={<Radio />}
            label="Add Existing Service Target"
            value="existing"
          />
        </RadioGroup>
      )}
      {(isEditMode || mode === 'new') && (
        <ServiceTargetForm
          configurationIndex={configurationIndex}
          onClose={onClose}
          serviceTargetIndex={serviceTargetIndex}
        />
      )}
      {!isEditMode && mode === 'existing' && (
        <AddExistingServiceTargetForm
          configurationIndex={configurationIndex}
          onClose={onClose}
        />
      )}
    </Drawer>
  );
};

interface AddExistingServiceTargetFormProps {
  configurationIndex: number;
  onClose: () => void;
}

const AddExistingServiceTargetForm = (
  props: AddExistingServiceTargetFormProps
) => {
  const { configurationIndex, onClose } = props;

  const {
    setFieldValue,
    values,
  } = useFormikContext<LoadBalancerCreateFormData>();

  const serviceTargets = values.configurations.reduce((acc, configuration) => {
    return [...acc, ...configuration.service_targets];
  }, []);

  const formik = useFormik<{ serviceTarget: ServiceTargetPayload | null }>({
    initialValues: {
      serviceTarget: null,
    },
    onSubmit({ serviceTarget }) {
      if (!serviceTarget) {
        throw new Error('No service target selected');
      }
      setFieldValue(`configurations[${configurationIndex}]service_targets`, [
        ...values.configurations[configurationIndex].service_targets,
        {
          ...serviceTarget,
          label: getNextLabel(serviceTarget, serviceTargets),
        },
      ]);
      onClose();
    },
    validate(values) {
      if (!values.serviceTarget) {
        return { serviceTarget: 'Please select an existing service target.' };
      }
      return {};
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Autocomplete
        errorText={formik.errors.serviceTarget}
        label="Service Target"
        noMarginTop
        onChange={(_, st) => formik.setFieldValue('serviceTarget', st)}
        options={serviceTargets}
      />
      <ActionsPanel
        primaryButtonProps={{
          label: 'Add Service Target',
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
