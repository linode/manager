import { yupResolver } from '@hookform/resolvers/yup';
import { createSubnetSchema } from '@linode/validation';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { useGrants, useProfile } from 'src/queries/profile/profile';
import { useCreateSubnetMutation, useVPCQuery } from 'src/queries/vpcs/vpcs';
import {
  DEFAULT_SUBNET_IPV4_VALUE,
  getRecommendedSubnetIPv4,
} from 'src/utilities/subnets';

import { NewSubnetNode } from '../VPCCreate/NewSubnetNode';

import type { CreateSubnetPayload } from '@linode/api-v4';

interface Props {
  onClose: () => void;
  open: boolean;
  vpcId: number;
}

export const SubnetCreateDrawer = (props: Props) => {
  const { onClose, open, vpcId } = props;

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();
  const { data: vpc } = useVPCQuery(vpcId, open);

  const userCannotAddSubnet = profile?.restricted && !grants?.global.add_vpcs;

  const recommendedIPv4 = getRecommendedSubnetIPv4(
    DEFAULT_SUBNET_IPV4_VALUE,
    vpc?.subnets?.map((subnet) => subnet.ipv4 ?? '') ?? []
  );

  const {
    mutateAsync: createSubnet,
    reset: resetRequest,
  } = useCreateSubnetMutation(vpcId);

  const {
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
  } = useForm<CreateSubnetPayload>({
    defaultValues: {
      ipv4: recommendedIPv4,
      label: '',
    },
    mode: 'onBlur',
    resolver: yupResolver(createSubnetSchema),
  });

  const values = watch();

  const onCreateSubnet = async () => {
    try {
      await createSubnet(values);
      onClose();
    } catch (errors) {
      for (const error of errors) {
        setError(error?.field ?? 'root', { message: error.reason });
      }
    }
  };

  return (
    <Drawer
      onExited={() => {
        reset();
        resetRequest();
      }}
      onClose={onClose}
      open={open}
      title={'Create Subnet'}
    >
      {errors.root?.message && (
        <Notice spacingBottom={8} text={errors.root.message} variant="error" />
      )}
      {userCannotAddSubnet && (
        <Notice
          text={
            "You don't have permissions to create a new Subnet. Please contact an account administrator for details."
          }
          important
          spacingBottom={8}
          spacingTop={16}
          variant="error"
        />
      )}
      <form onSubmit={handleSubmit(onCreateSubnet)}>
        <NewSubnetNode
          onChange={(subnet) => {
            setValue('label', subnet.label, {
              shouldDirty: true,
              shouldValidate: true,
            });
            setValue('ipv4', subnet.ipv4, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
          disabled={userCannotAddSubnet}
          ipv4Error={errors.ipv4?.message}
          labelError={errors.label?.message}
          subnet={values}
        />
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'create-subnet-drawer-button',
            disabled: !isDirty || userCannotAddSubnet,
            label: 'Create Subnet',
            loading: isSubmitting,
            type: 'submit',
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
        />
      </form>
    </Drawer>
  );
};
