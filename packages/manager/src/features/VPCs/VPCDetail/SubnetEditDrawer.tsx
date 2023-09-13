import { ModifySubnetPayload } from '@linode/api-v4/lib/vpcs/types';
import { Subnet } from '@linode/api-v4/lib/vpcs/types';
import { useFormik } from 'formik';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { useGrants, useProfile } from 'src/queries/profile';
import { useUpdateSubnetMutation } from 'src/queries/vpcs';
import { getErrorMap } from 'src/utilities/errorUtils';

interface Props {
  onClose: () => void;
  open: boolean;
  subnet?: Subnet;
  vpcId: number;
}

const IP_HELPER_TEXT =
  'Once a subnet is created its IP range cannot be edited.';

export const SubnetEditDrawer = (props: Props) => {
  const { onClose, open, subnet, vpcId } = props;

  const {
    error,
    isLoading,
    mutateAsync: updateSubnet,
    reset,
  } = useUpdateSubnetMutation(vpcId, subnet?.id ?? -1);

  const form = useFormik<ModifySubnetPayload>({
    enableReinitialize: true,
    initialValues: {
      label: subnet?.label ?? '',
    },
    async onSubmit(values) {
      await updateSubnet(values);
      onClose();
    },
  });

  React.useEffect(() => {
    if (open) {
      form.resetForm();
      reset();
    }
  }, [open]);

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();

  const vpcPermissions = grants?.vpc.find((v) => v.id === vpcId);

  // there isn't a 'view VPC/Subnet' grant that does anything, so all VPCs get returned even for restricted users
  // with permissions set to 'None'. Therefore, we're treating those as read_only as well
  const readOnly =
    Boolean(profile?.restricted) &&
    (vpcPermissions?.permissions === 'read_only' || grants?.vpc.length === 0);

  const errorMap = getErrorMap(['label'], error);

  return (
    <Drawer onClose={onClose} open={open} title="Edit Subnet">
      {errorMap.none && <Notice text={errorMap.none} variant="error" />}
      {readOnly && (
        <Notice
          important
          text={`You don't have permissions to edit ${subnet?.label}. Please contact an account administrator for details.`}
          variant="error"
        />
      )}
      <form onSubmit={form.handleSubmit}>
        <TextField
          disabled={readOnly}
          errorText={errorMap.label}
          label="Label"
          name="label"
          onChange={form.handleChange}
          value={form.values.label}
        />
        <TextField
          disabled
          label="Subnet IP Address Range"
          tooltipText={IP_HELPER_TEXT}
          value={subnet?.ipv4}
        />
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'save-button',
            disabled: !form.dirty,
            label: 'Save',
            loading: isLoading,
            type: 'submit',
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
        />
      </form>
    </Drawer>
  );
};
