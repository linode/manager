import { createSubnetSchema } from '@linode/validation';
import { useFormik } from 'formik';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { useGrants, useProfile } from 'src/queries/profile';
import { useAllSubnetsQuery, useCreateSubnetMutation } from 'src/queries/vpcs';
import { getErrorMap } from 'src/utilities/errorUtils';
import {
  DEFAULT_SUBNET_IPV4_VALUE,
  SubnetFieldState,
  getRecommendedSubnetIPv4,
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
  const { data: allSubnets } = useAllSubnetsQuery(vpcId);

  const userCannotAddSubnet = profile?.restricted && !grants?.global.add_vpcs;

  const recommendedIPv4 =
    allSubnets && allSubnets.length > 0
      ? getRecommendedSubnetIPv4(
          allSubnets[0].ipv4 ?? '',
          allSubnets.map((subnet) => subnet.ipv4 ?? '')
        )
      : DEFAULT_SUBNET_IPV4_VALUE;

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
      await createSubnet({ ipv4: values.ip.ipv4, label: values.label });
      onClose();
    } catch (errors) {
      const newErrors = getErrorMap(['label', 'ipv4'], errors);
      setErrorMap(newErrors);
      setValues({
        ip: {
          ...values.ip,
          ipv4Error: newErrors.ipv4,
        },
        label: values.label,
        labelError: newErrors.label,
      });
    }
  };

  const { dirty, handleSubmit, resetForm, setValues, values } = useFormik({
    enableReinitialize: true,
    initialValues: {
      ip: {
        availIPv4s: 256,
        ipv4: recommendedIPv4,
      },
      // @TODO VPC: add IPv6 when that is supported
      label: '',
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
      setErrorMap({});
    }
  }, [open, reset, resetForm]);

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
          disabled={userCannotAddSubnet}
          subnet={values}
        />
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'create-subnet-drawer-button',
            disabled: !dirty || userCannotAddSubnet,
            label: 'Create Subnet',
            loading: isLoading,
            onClick: onCreateSubnet,
            type: 'submit',
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
        />
      </form>
    </Drawer>
  );
};
