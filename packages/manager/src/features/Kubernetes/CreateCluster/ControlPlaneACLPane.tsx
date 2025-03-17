import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  Notice,
  Toggle,
  Typography,
} from '@linode/ui';
import { FormLabel, styled } from '@mui/material';
import * as React from 'react';

import { ErrorMessage } from 'src/components/ErrorMessage';
import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';
import { validateIPs } from 'src/utilities/ipUtils';

import {
  CREATE_CLUSTER_ENTERPRISE_TIER_ACL_COPY_BASE,
  CREATE_CLUSTER_ENTERPRISE_TIER_ACL_COPY_REQUIRED_IPs,
  CREATE_CLUSTER_STANDARD_TIER_ACL_COPY,
} from '../constants';

import type { KubernetesTier } from '@linode/api-v4';
import type { ExtendedIP } from 'src/utilities/ipUtils';

export interface ControlPlaneACLProps {
  enableControlPlaneACL: boolean;
  errorText: string | undefined;
  handleIPv4Change: (ips: ExtendedIP[]) => void;
  handleIPv6Change: (ips: ExtendedIP[]) => void;
  handleIsAcknowledgementChecked: (isChecked: boolean) => void;
  ipV4Addr: ExtendedIP[];
  ipV6Addr: ExtendedIP[];
  isAcknowledgementChecked: boolean;
  selectedTier: KubernetesTier;
  setControlPlaneACL: (enabled: boolean) => void;
}

export const ControlPlaneACLPane = (props: ControlPlaneACLProps) => {
  const {
    enableControlPlaneACL,
    errorText,
    handleIPv4Change,
    handleIPv6Change,
    handleIsAcknowledgementChecked,
    ipV4Addr,
    ipV6Addr,
    isAcknowledgementChecked,
    selectedTier,
    setControlPlaneACL,
  } = props;

  const isEnterpriseCluster = selectedTier === 'enterprise';

  const getACLCopy = () => {
    {
      if (isEnterpriseCluster && isAcknowledgementChecked) {
        return CREATE_CLUSTER_ENTERPRISE_TIER_ACL_COPY_BASE;
      } else if (isEnterpriseCluster) {
        return CREATE_CLUSTER_ENTERPRISE_TIER_ACL_COPY_REQUIRED_IPs;
      } else {
        return CREATE_CLUSTER_STANDARD_TIER_ACL_COPY;
      }
    }
  };

  return (
    <>
      <FormControl data-testid="control-plane-ipacl-form">
        <FormLabel id="ipacl-radio-buttons-group-label">
          <Typography variant="inherit">Control Plane ACL</Typography>
        </FormLabel>
        {errorText && (
          <Notice spacingTop={8} variant="error">
            <ErrorMessage message={errorText} />{' '}
          </Notice>
        )}
        <Typography mb={1} sx={{ width: '85%' }}>
          {getACLCopy()}
        </Typography>
        <FormControlLabel
          control={
            <StyledACLToggle
              checked={enableControlPlaneACL}
              disabled={isEnterpriseCluster}
              name="ipacl-checkbox"
              onChange={() => setControlPlaneACL(!enableControlPlaneACL)}
            />
          }
          label="Enable Control Plane ACL"
        />
      </FormControl>
      {enableControlPlaneACL && (
        <Box marginBottom={2}>
          <Box sx={{ marginBottom: 1, maxWidth: 450 }}>
            <MultipleIPInput
              onBlur={(_ips: ExtendedIP[]) => {
                const validatedIPs = validateIPs(_ips, {
                  allowEmptyAddress: true,
                  errorMessage: 'Must be a valid IPv4 address.',
                });
                handleIPv4Change(validatedIPs);
              }}
              buttonText="Add IPv4 Address"
              ips={ipV4Addr}
              isLinkStyled
              onChange={handleIPv4Change}
              title="IPv4 Addresses or CIDRs"
            />
            <Box marginTop={2}>
              <MultipleIPInput
                onBlur={(_ips: ExtendedIP[]) => {
                  const validatedIPs = validateIPs(_ips, {
                    allowEmptyAddress: true,
                    errorMessage: 'Must be a valid IPv6 address.',
                  });
                  handleIPv6Change(validatedIPs);
                }}
                buttonText="Add IPv6 Address"
                ips={ipV6Addr}
                isLinkStyled
                onChange={handleIPv6Change}
                title="IPv6 Addresses or CIDRs"
              />
            </Box>
          </Box>
          {isEnterpriseCluster && (
            <FormControlLabel
              control={
                <Checkbox
                  onChange={() =>
                    handleIsAcknowledgementChecked(!isAcknowledgementChecked)
                  }
                  name="acl-acknowledgement"
                />
              }
              data-qa-checkbox="acl-acknowledgement"
              label="Provide an ACL later. The control plane will be unreachable until an ACL is defined."
            />
          )}
        </Box>
      )}
    </>
  );
};

export const StyledACLToggle = styled(Toggle, {
  label: 'StyledACLToggle',
})(({ theme }) => ({
  // Keep the checked, disabled toggle a faded blue for LKE Enterprise.
  '& .MuiSwitch-switchBase.Mui-disabled+.MuiSwitch-track': {
    backgroundColor: theme.tokens.color.Brand[50],
    borderColor: theme.tokens.color.Brand[50],
  },
}));
