import { CreateSubnetPayload } from '@linode/api-v4';
import { createSubnetSchema } from '@linode/validation';
import { useFormik } from 'formik';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { FormHelperText } from 'src/components/FormHelperText';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { useGrants, useProfile } from 'src/queries/profile';
import { useCreateSubnetMutation } from 'src/queries/vpcs';
import { getErrorMap } from 'src/utilities/errorUtils';
import {
  calculateAvailableIPv4s,
  DEFAULT_SUBNET_IPV4_VALUE,
  RESERVED_IP_NUMBER,
} from 'src/utilities/subnets';

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

  const [availIPv4s, setAvailIPv4s] = React.useState<number | undefined>(256);

  const onCreateSubnet = async () => {
    try {
      await createSubnet(values);
      onClose();
    } catch (errors) {
      // will get an warning for uncaught error messages without a try/catch - is that ok?
    }
  };

  const {
    dirty,
    handleSubmit,
    resetForm,
    setFieldValue,
    values,
  } = useFormik<CreateSubnetPayload>({
    enableReinitialize: true,
    initialValues: {
      // TODO VPC - add IPv6 when that is supported
      label: '',
      ipv4: DEFAULT_SUBNET_IPV4_VALUE,
    },
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
      <form onSubmit={handleSubmit}>
        <TextField
          disabled={userCannotAddSubnet}
          errorText={errorMap.label}
          label="Subnet label"
          name="label"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFieldValue('label', e.target.value)
          }
          placeholder="Enter a subnet label"
          value={values.label}
        />
        <TextField
          disabled={userCannotAddSubnet}
          errorText={errorMap.ipv4}
          label="Subnet IP Address Range"
          name="ipv4"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setFieldValue('ipv4', e.target.value);
            const availIPAddresses = calculateAvailableIPv4s(e.target.value);
            setAvailIPv4s(availIPAddresses);
          }}
          rows={1}
          value={values.ipv4}
        />
        {availIPv4s && (
          <FormHelperText>
            Available IP Addresses:{' '}
            {availIPv4s > 4 ? availIPv4s - RESERVED_IP_NUMBER : 0}
          </FormHelperText>
        )}
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
