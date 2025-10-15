import { yupResolver } from '@hookform/resolvers/yup';
import { useCreateSubnetMutation, useVPCQuery } from '@linode/queries';
import {
  ActionsPanel,
  Drawer,
  FormHelperText,
  Notice,
  Select,
  Stack,
  TextField,
} from '@linode/ui';
import {
  createSubnetSchemaIPv4,
  createSubnetSchemaWithIPv6,
} from '@linode/validation';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useVPCDualStack } from 'src/hooks/useVPCDualStack';
import {
  calculateAvailableIPv4sRFC1918,
  calculateAvailableIPv6Linodes,
  DEFAULT_SUBNET_IPV4_VALUE,
  getRecommendedSubnetIPv4,
  RESERVED_IP_NUMBER,
  SUBNET_IPV6_PREFIX_LENGTHS,
} from 'src/utilities/subnets';

import type { CreateSubnetPayload, Subnet } from '@linode/api-v4';

interface Props {
  onClose: () => void;
  open: boolean;
  vpcId: number;
}

export const SubnetCreateDrawer = (props: Props) => {
  const { onClose, open, vpcId } = props;

  const { data: vpc } = useVPCQuery(vpcId, open);

  const { data: permissions } = usePermissions(
    'vpc',
    ['create_vpc_subnet'],
    vpcId
  );

  const canCreateSubnet = permissions?.create_vpc_subnet;
  const recommendedIPv4 = getRecommendedSubnetIPv4(
    DEFAULT_SUBNET_IPV4_VALUE,
    vpc?.subnets?.map((subnet: Subnet) => subnet.ipv4 ?? '') ?? []
  );

  const {
    isPending,
    mutateAsync: createSubnet,
    reset: resetRequest,
  } = useCreateSubnetMutation(vpcId);

  const { shouldDisplayIPv6, recommendedIPv6 } = useVPCDualStack(vpc?.ipv6);

  const {
    control,
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    reset: resetForm,
    setError,
    watch,
  } = useForm<CreateSubnetPayload>({
    mode: 'onBlur',
    resolver: yupResolver(
      shouldDisplayIPv6 ? createSubnetSchemaWithIPv6 : createSubnetSchemaIPv4
    ),
    values: {
      ipv4: recommendedIPv4,
      ipv6: recommendedIPv6,
      label: '',
    },
  });

  const ipv4 = watch('ipv4');
  const numberOfAvailableIPv4IPs = calculateAvailableIPv4sRFC1918(ipv4 ?? '');

  const numberOfAvailableIPv4Linodes =
    numberOfAvailableIPv4IPs && numberOfAvailableIPv4IPs > 4
      ? numberOfAvailableIPv4IPs - RESERVED_IP_NUMBER
      : 0;

  const onCreateSubnet = async (values: CreateSubnetPayload) => {
    try {
      await createSubnet(values);
      handleClose();
    } catch (errors) {
      for (const error of errors) {
        setError(error?.field ?? 'root', { message: error.reason });
      }
    }
  };

  const handleClose = () => {
    resetForm();
    resetRequest();
    onClose();
  };

  return (
    <Drawer onClose={handleClose} open={open} title={'Create Subnet'}>
      {errors.root?.message && (
        <Notice spacingBottom={8} text={errors.root.message} variant="error" />
      )}
      {!canCreateSubnet && (
        <Notice
          spacingBottom={8}
          spacingTop={16}
          text={
            "You don't have permissions to create a new Subnet. Please contact an account administrator for details."
          }
          variant="error"
        />
      )}
      <form onSubmit={handleSubmit(onCreateSubnet)}>
        <Stack>
          <Controller
            control={control}
            name="label"
            render={({ field, fieldState }) => (
              <TextField
                aria-label="Enter a subnet label"
                disabled={!canCreateSubnet}
                errorText={fieldState.error?.message}
                label="Subnet Label"
                onBlur={field.onBlur}
                onChange={field.onChange}
                placeholder="Enter a subnet label"
                value={field.value}
              />
            )}
          />
          <Controller
            control={control}
            name="ipv4"
            render={({ field, fieldState }) => (
              <TextField
                aria-label="Enter an IPv4"
                disabled={!canCreateSubnet}
                errorText={fieldState.error?.message}
                label={
                  shouldDisplayIPv6
                    ? 'Subnet IPv4 Range (CIDR)'
                    : 'Subnet IP Address Range'
                }
                onBlur={field.onBlur}
                onChange={field.onChange}
                value={field.value}
              />
            )}
          />
          {numberOfAvailableIPv4IPs && !shouldDisplayIPv6 && (
            <FormHelperText>
              Number of Available IP Addresses:{' '}
              {numberOfAvailableIPv4IPs > RESERVED_IP_NUMBER
                ? (
                    numberOfAvailableIPv4IPs - RESERVED_IP_NUMBER
                  ).toLocaleString()
                : 0}
            </FormHelperText>
          )}
          {shouldDisplayIPv6 && (
            <Controller
              control={control}
              name="ipv6.0.range"
              render={({ field, fieldState }) => (
                <Select
                  errorText={fieldState.error?.message}
                  helperText={`Number of Linodes: ${Math.min(
                    numberOfAvailableIPv4Linodes,
                    calculateAvailableIPv6Linodes(field.value)
                  )}`}
                  label="IPv6 Prefix Length"
                  onChange={(_, option) => field.onChange(option.value)}
                  options={SUBNET_IPV6_PREFIX_LENGTHS}
                  sx={{
                    width: 140,
                  }}
                  value={SUBNET_IPV6_PREFIX_LENGTHS.find(
                    (option) => option.value === field.value
                  )}
                />
              )}
            />
          )}
        </Stack>
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'create-subnet-drawer-button',
            disabled: !isDirty || !canCreateSubnet,
            label: 'Create Subnet',
            loading: isPending || isSubmitting,
            type: 'submit',
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: handleClose }}
        />
      </form>
    </Drawer>
  );
};
