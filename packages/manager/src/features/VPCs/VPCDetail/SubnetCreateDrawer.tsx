import { yupResolver } from '@hookform/resolvers/yup';
import { Notice, Stack } from '@linode/ui';
import { FormHelperText } from '@linode/ui';
import { createSubnetSchema } from '@linode/validation';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { TextField } from 'src/components/TextField';
import { useGrants, useProfile } from 'src/queries/profile/profile';
import { useCreateSubnetMutation, useVPCQuery } from 'src/queries/vpcs/vpcs';
import {
  DEFAULT_SUBNET_IPV4_VALUE,
  RESERVED_IP_NUMBER,
  calculateAvailableIPv4sRFC1918,
  getRecommendedSubnetIPv4,
} from 'src/utilities/subnets';

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
    isPending,
    mutateAsync: createSubnet,
    reset: resetRequest,
  } = useCreateSubnetMutation(vpcId);

  const {
    control,
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    reset: resetForm,
    setError,
    watch,
  } = useForm<CreateSubnetPayload>({
    defaultValues: {
      ipv4: recommendedIPv4,
      label: '',
    },
    mode: 'onBlur',
    resolver: yupResolver(createSubnetSchema),
  });

  const ipv4 = watch('ipv4');
  const numberOfAvailableIPs = calculateAvailableIPv4sRFC1918(ipv4 ?? '');

  const onCreateSubnet = async (values: CreateSubnetPayload) => {
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
        resetForm();
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
        <Stack>
          <Controller
            render={({ field, fieldState }) => (
              <TextField
                aria-label="Enter a subnet label"
                disabled={userCannotAddSubnet}
                errorText={fieldState.error?.message}
                label="Subnet Label"
                onBlur={field.onBlur}
                onChange={field.onChange}
                placeholder="Enter a subnet label"
                value={field.value}
              />
            )}
            control={control}
            name="label"
          />
          <Controller
            render={({ field, fieldState }) => (
              <TextField
                aria-label="Enter an IPv4"
                disabled={userCannotAddSubnet}
                errorText={fieldState.error?.message}
                label="Subnet IP Address Range"
                onBlur={field.onBlur}
                onChange={field.onChange}
                value={field.value}
              />
            )}
            control={control}
            name="ipv4"
          />
          {numberOfAvailableIPs && (
            <FormHelperText>
              Number of Available IP Addresses:{' '}
              {numberOfAvailableIPs > RESERVED_IP_NUMBER
                ? (numberOfAvailableIPs - RESERVED_IP_NUMBER).toLocaleString()
                : 0}
            </FormHelperText>
          )}
        </Stack>
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'create-subnet-drawer-button',
            disabled: !isDirty || userCannotAddSubnet,
            label: 'Create Subnet',
            loading: isPending || isSubmitting,
            type: 'submit',
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
        />
      </form>
    </Drawer>
  );
};
