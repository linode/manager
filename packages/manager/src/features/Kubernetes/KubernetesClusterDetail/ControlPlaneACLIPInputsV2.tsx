import { Box } from '@mui/material';
import * as React from 'react';

import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';

import type { FieldError, Merge } from 'react-hook-form';
import type { ExtendedIP } from 'src/utilities/ipUtils';

interface Props {
  handleIPv4Change: (ips: string[]) => void;
  handleIPv6Change: (ips: string[]) => void;
  ipV4Addr: string[];
  ipV6Addr: string[];
  ipv4Errors?: Merge<FieldError, (FieldError | undefined)[]>;
  ipv6Errors?: Merge<FieldError, (FieldError | undefined)[]>;
  marginAfter?: boolean;
}

export const ControlPlaneACLIPInputsV2 = (props: Props) => {
  const {
    handleIPv4Change,
    handleIPv6Change,
    ipV4Addr,
    ipV6Addr,
    ipv4Errors,
    ipv6Errors,
    marginAfter,
  } = props;

  const extendedIPv4: ExtendedIP[] =
    ipV4Addr?.map((ip, idx) => {
      return {
        address: ip,
        error: ipv4Errors ? ipv4Errors[idx]?.message : '',
      };
    }) ?? [];

  const extendedIPv6: ExtendedIP[] =
    ipV6Addr?.map((ip, idx) => {
      return {
        address: ip,
        error: ipv6Errors ? ipv6Errors[idx]?.message : '',
      };
    }) ?? [];

  const outerSx = marginAfter
    ? { marginBottom: 3, maxWidth: 450 }
    : { maxWidth: 450 };

  return (
    <Box sx={{ ...outerSx }}>
      <MultipleIPInput
        onChange={(ips: ExtendedIP[]) => {
          const _ips = ips.map((ip) => {
            return ip.address;
          });
          handleIPv4Change(_ips);
        }}
        buttonText="Add IPv4 Address"
        ips={extendedIPv4}
        isLinkStyled
        placeholder="0.0.0.0/0"
        title="IPv4 Addresses or CIDRs"
      />
      <Box marginTop={2}>
        <MultipleIPInput
          onChange={(ips: ExtendedIP[]) => {
            const _ips = ips.map((ip) => {
              return ip.address;
            });
            handleIPv6Change(_ips);
          }}
          buttonText="Add IPv6 Address"
          ips={extendedIPv6}
          isLinkStyled
          placeholder="::/0"
          title="IPv6 Addresses or CIDRs"
        />
      </Box>
    </Box>
  );
};
