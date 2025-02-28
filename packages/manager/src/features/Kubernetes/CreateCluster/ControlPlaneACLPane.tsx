import {
  Box,
  FormControl,
  FormControlLabel,
  Notice,
  Toggle,
  Typography,
} from '@linode/ui';
import { FormLabel } from '@mui/material';
import * as React from 'react';

import { ErrorMessage } from 'src/components/ErrorMessage';
import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';
import { validateIPs } from 'src/utilities/ipUtils';

import {
  CREATE_CLUSTER_ENTERPRISE_TIER_ACL_ACTIVATION_STATUS_COPY,
  CREATE_CLUSTER_STANDARD_TIER_ACL_ACTIVATION_STATUS_COPY,
} from '../constants';

import type { KubernetesTier } from '@linode/api-v4';
import type { ExtendedIP } from 'src/utilities/ipUtils';

export interface ControlPlaneACLProps {
  enableControlPlaneACL: boolean;
  errorText: string | undefined;
  handleIPv4Change: (ips: ExtendedIP[]) => void;
  handleIPv6Change: (ips: ExtendedIP[]) => void;
  ipV4Addr: ExtendedIP[];
  ipV6Addr: ExtendedIP[];
  selectedTier: KubernetesTier;
  setControlPlaneACL: (enabled: boolean) => void;
}

export const ControlPlaneACLPane = (props: ControlPlaneACLProps) => {
  const {
    enableControlPlaneACL,
    errorText,
    handleIPv4Change,
    handleIPv6Change,
    ipV4Addr,
    ipV6Addr,
    selectedTier,
    setControlPlaneACL,
  } = props;

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
          {selectedTier === 'enterprise'
            ? CREATE_CLUSTER_ENTERPRISE_TIER_ACL_ACTIVATION_STATUS_COPY
            : CREATE_CLUSTER_STANDARD_TIER_ACL_ACTIVATION_STATUS_COPY}
        </Typography>
        {selectedTier !== 'enterprise' && (
          <FormControlLabel
            control={
              <Toggle
                checked={enableControlPlaneACL}
                name="ipacl-checkbox"
                onChange={() => setControlPlaneACL(!enableControlPlaneACL)}
              />
            }
            label="Enable Control Plane ACL"
          />
        )}
      </FormControl>
      {enableControlPlaneACL && (
        <Box sx={{ marginBottom: 3, maxWidth: 450 }}>
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
      )}
    </>
  );
};
