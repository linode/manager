import { createSubnetSchema } from '@linode/validation';
import { useFormik } from 'formik';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { useGrants, useProfile } from 'src/queries/profile';
import { useCreateSubnetMutation } from 'src/queries/vpcs';
import { getErrorMap } from 'src/utilities/errorUtils';
import {
  DEFAULT_SUBNET_IPV4_VALUE,
  SubnetFieldState,
} from 'src/utilities/subnets';

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

  const [errorMap, setErrorMap] = React.useState<
    Record<string, string | undefined>
  >({});

  const {
    isLoading,
    mutateAsync: createSubnet,
    reset,
  } = useCreateSubnetMutation(vpcId);

  const onCreateSubnet = async () => {
    try {
      await createSubnet({ label: values.label, ipv4: values.ip.ipv4 });
      onClose();
    } catch (errors) {
      const newErrors = getErrorMap(['label', 'ipv4'], errors);
      setErrorMap(newErrors);
      setValues({
        label: values.label,
        labelError: newErrors.label,
        ip: {
          ...values.ip,
          ipv4Error: newErrors.ipv4,
        },
      });
    }
  };

  const { dirty, handleSubmit, resetForm, setValues, values } = useFormik({
    enableReinitialize: true,
    initialValues: {
      // TODO VPC - add IPv6 when that is supported
      label: '',
      ip: {
        ipv4: DEFAULT_SUBNET_IPV4_VALUE,
        availIPv4s: 256,
      },
    } as SubnetFieldState,
    onSubmit: onCreateSubnet,
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: createSubnetSchema,
  });

  React.useEffect(() => {
    if (open) {
      resetForm();
      reset();
    }
  }, [open]);

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
      <form onSubmit={handleSubmit}>
        <SubnetNode
          onChange={(subnetState) => {
            setValues(subnetState);
          }}
          subnet={values}
        />
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'create-subnet-button',
            disabled: !dirty || userCannotAddSubnet,
            label: 'Create subnet',
            loading: isLoading,
            type: 'submit',
            onClick: onCreateSubnet,
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
        />
      </form>
    </Drawer>
  );
};
