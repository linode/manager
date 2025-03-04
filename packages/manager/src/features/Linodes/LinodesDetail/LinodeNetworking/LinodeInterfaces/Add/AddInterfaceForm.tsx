import { FormControlLabel, Radio, RadioGroup } from '@linode/ui';
import React from 'react';
import { useForm } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';

import type { CreateLinodeInterfacePayload } from '@linode/api-v4';

interface Props {
  linodeId: number;
  onClose: () => void;
}

export const AddInterfaceForm = (props: Props) => {
  const form = useForm<CreateLinodeInterfacePayload>();

  const onSubmit = (values: CreateLinodeInterfacePayload) => {
    alert(JSON.stringify(values, null, 2));
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <RadioGroup>
        <FormControlLabel control={<Radio />} label="Public" value="vlan" />
        <FormControlLabel control={<Radio />} label="VPC" value="vpc" />
        <FormControlLabel control={<Radio />} label="VLAN" value="public" />
      </RadioGroup>
      <ActionsPanel
        primaryButtonProps={{
          label: 'Add Network Interface',
          type: 'submit',
        }}
        secondaryButtonProps={{
          label: 'Cancel',
          onClick: props.onClose,
        }}
      />
    </form>
  );
};
