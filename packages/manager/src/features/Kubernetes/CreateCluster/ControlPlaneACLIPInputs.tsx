import { Box } from '@mui/material';
import * as React from 'react';

import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';

import type { ExtendedIP } from 'src/utilities/ipUtils';

interface Props {
  handleIPv4Blur: (ips: ExtendedIP[]) => void;
  handleIPv4Change: (ips: ExtendedIP[]) => void;
  handleIPv6Blur: (ips: ExtendedIP[]) => void;
  handleIPv6Change: (ips: ExtendedIP[]) => void;
  ipV4Addr: ExtendedIP[];
  ipV6Addr: ExtendedIP[];
  marginAfter?: boolean;
}

export const ControlPlaneACLIPInputs = (props: Props) => {
  const {
    handleIPv4Blur,
    handleIPv4Change,
    handleIPv6Blur,
    handleIPv6Change,
    ipV4Addr,
    ipV6Addr,
    marginAfter,
  } = props;

  const outerSx = marginAfter
    ? { marginBottom: 3, maxWidth: 450 }
    : { maxWidth: 450 };

  return (
    <Box sx={{ ...outerSx }}>
      <MultipleIPInput
        buttonText="Add IPv4 Address"
        ips={ipV4Addr}
        isLinkStyled
        onBlur={handleIPv4Blur}
        onChange={handleIPv4Change}
        placeholder="0.0.0.0/0"
        title="IPv4 Addresses or CIDRs"
      />
      <Box marginTop={2}>
        <MultipleIPInput
          buttonText="Add IPv6 Address"
          ips={ipV6Addr}
          isLinkStyled
          onBlur={handleIPv6Blur}
          onChange={handleIPv6Change}
          placeholder="::/0"
          title="IPv6 Addresses or CIDRs"
        />
      </Box>
    </Box>
  );
};
