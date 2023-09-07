import { CreateSubnetPayload, Subnet } from '@linode/api-v4';
import { useFormik } from 'formik';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { useGrants, useProfile } from 'src/queries/profile';
import { useCreateSubnetMutation } from 'src/queries/vpcs';
import { getErrorMap } from 'src/utilities/errorUtils';

import { SubnetNode } from '../VPCCreate/SubnetNode';

interface Props {
  onClose: () => void;
  open: boolean;
  vpcId: number;
}

export const SubnetCreateDrawer = (props: Props) => {
  const { onClose, open, vpcId } = props;

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();

  const userCannotAddSubnet = profile?.restricted && !grants?.global.add_vpcs;

  const {
    error,
    isLoading,
    mutateAsync: createSubnet,
    reset,
  } = useCreateSubnetMutation(vpcId);

  const form = useFormik<CreateSubnetPayload>({
    enableReinitialize: true,
    initialValues: {
      // TODO VPC - add IPv6 when that is supported
      label: '',
      ipv4: '',
    },
    async onSubmit(values) {
      // may need to change this if we want to use subnet node ... lol
      await createSubnet(values);
      onClose();
    },
  });

  React.useEffect(() => {
    if (open) {
      form.resetForm();
      reset();
    }
  }, [open]);

  const errorMap = getErrorMap(['label', 'ipv4'], error);

  return (
    <Drawer onClose={onClose} open={open} title={'Create Subnet'}>
      {errorMap.none && <Notice text={errorMap.none} variant="error" />}
      {userCannotAddSubnet && (
        <Notice
          text={
            "You don't have permissions to create a new Subnet. Please contact an account administrator for details."
          }
          important
          spacingTop={16}
          variant="error"
        />
      )}
      <form onSubmit={form.handleSubmit}>
        <TextField
          disabled={userCannotAddSubnet}
          errorText={errorMap.label}
          label="Subnet label"
          onChange={form.handleChange}
          value={form.values.label}
        />
        <TextField
          disabled={userCannotAddSubnet}
          errorText={errorMap.ipv4}
          label="Subnet IP Address Range"
          onChange={form.handleChange}
          rows={1}
          value={form.values.ipv4}
        />
        <ActionsPanel
          primaryButtonProps={{
            disabled: !form.dirty || userCannotAddSubnet,
            label: 'Create subnet',
            loading: isLoading,
            type: 'submit',
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
        />
      </form>
    </Drawer>
  );
};
