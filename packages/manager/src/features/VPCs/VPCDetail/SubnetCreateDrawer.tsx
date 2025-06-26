import { yupResolver } from '@hookform/resolvers/yup';
import {
  useAccount,
  useCreateSubnetMutation,
  useGrants,
  useProfile,
  useVPCQuery,
} from '@linode/queries';
import {
  ActionsPanel,
  Drawer,
  FormHelperText,
  Notice,
  Select,
  Stack,
  TextField,
} from '@linode/ui';
import { isFeatureEnabledV2 } from '@linode/utilities';
import { createSubnetSchemaIPv4 } from '@linode/validation';
import * as React from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

import { useFlags } from 'src/hooks/useFlags';
import {
  calculateAvailableIPv4sRFC1918,
  DEFAULT_SUBNET_IPV4_VALUE,
  getRecommendedSubnetIPv4,
  RESERVED_IP_NUMBER,
} from 'src/utilities/subnets';

import type { CreateSubnetPayload, Subnet } from '@linode/api-v4';

interface Props {
  onClose: () => void;
  open: boolean;
  vpcId: number;
}

export const SubnetCreateDrawer = (props: Props) => {
  const { onClose, open, vpcId } = props;

  const { data: account } = useAccount();
  const { data: profile } = useProfile();
  const { data: grants } = useGrants();
  const { data: vpc } = useVPCQuery(vpcId, open);
  const flags = useFlags();

  const userCannotAddSubnet = profile?.restricted && !grants?.global.add_vpcs;

  const recommendedIPv4 = getRecommendedSubnetIPv4(
    DEFAULT_SUBNET_IPV4_VALUE,
    vpc?.subnets?.map((subnet: Subnet) => subnet.ipv4 ?? '') ?? []
  );

  const {
    isPending,
    mutateAsync: createSubnet,
    reset: resetRequest,
  } = useCreateSubnetMutation(vpcId);

  const isDualStackEnabled = isFeatureEnabledV2(
    'VPC Dual Stack',
    Boolean(flags.vpcIpv6),
    account?.capabilities ?? []
  );

  const recommendedIPv6 = isDualStackEnabled
    ? [
        {
          range: '/56',
        },
      ]
    : undefined;

  const {
    control,
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    reset: resetForm,
    setError,
    watch,
  } = useForm<CreateSubnetPayload>({
    mode: 'onBlur',
    resolver: yupResolver(createSubnetSchemaIPv4),
    values: {
      ipv4: recommendedIPv4,
      ipv6: recommendedIPv6,
      label: '',
    },
  });

  const ipv4 = watch('ipv4');
  const numberOfAvailableIPs = calculateAvailableIPv4sRFC1918(ipv4 ?? '');

  const { append, fields, remove } = useFieldArray({
    control,
    name: 'ipv6',
  });

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
      {userCannotAddSubnet && (
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
                disabled={userCannotAddSubnet}
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
                disabled={userCannotAddSubnet}
                errorText={fieldState.error?.message}
                label="Subnet IP Address Range"
                onBlur={field.onBlur}
                onChange={field.onChange}
                value={field.value}
              />
            )}
          />
          {numberOfAvailableIPs && (
            <FormHelperText>
              Number of Available IP Addresses:{' '}
              {numberOfAvailableIPs > RESERVED_IP_NUMBER
                ? (numberOfAvailableIPs - RESERVED_IP_NUMBER).toLocaleString()
                : 0}
            </FormHelperText>
          )}
          {isDualStackEnabled && (
            <Controller
              control={control}
              name="ipv6"
              render={() => {
                return (
                  <Select
                    label="IPv6 CIDR"
                    onChange={(_, selectedOption) => {
                      remove(0);
                      append({
                        range: selectedOption.value,
                      });
                    }}
                    options={ipv6CIDROptions}
                    sx={{
                      width: 140,
                    }}
                    value={ipv6CIDROptions.find(
                      (option) => option.value === fields[0].range
                    )}
                  />
                );
              }}
            />
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
          secondaryButtonProps={{ label: 'Cancel', onClick: handleClose }}
        />
      </form>
    </Drawer>
  );
};

interface Ipv6CIDROption {
  label: string;
  value: string;
}

export const ipv6CIDROptions: Ipv6CIDROption[] = [
  {
    label: '/52',
    value: '/52',
  },
  {
    label: '/53',
    value: '/53',
  },
  {
    label: '/54',
    value: '/54',
  },
  {
    label: '/55',
    value: '/55',
  },
  {
    label: '/56',
    value: '/56',
  },
  {
    label: '/57',
    value: '/57',
  },
  {
    label: '/58',
    value: '/58',
  },
  {
    label: '/59',
    value: '/59',
  },
  {
    label: '/60',
    value: '/60',
  },
  {
    label: '/61',
    value: '/61',
  },
  {
    label: '/62',
    value: '/62',
  },
];
