import * as React from 'react';
import type { FieldError, Merge } from 'react-hook-form';

import { MultipleIPInput } from './MultipleIPInput';

import type { MultipeIPInputProps } from './MultipleIPInput';
import type { ExtendedIP } from 'src/utilities/ipUtils';

interface Props extends Omit<MultipeIPInputProps, 'ips' | 'onChange'> {
  ipErrors?: Merge<FieldError, (FieldError | undefined)[]>;
  nonExtendedIPs: string[];
  onNonExtendedIPChange: (ips: string[]) => void;
}

/**
 * Quick wrapper for MultipleIPInput so that we do not have to directly use the type ExtendedIP (which has its own error field)
 *
 * I wanted to avoid touching MultipleIPInput too much, since a lot of other flows use that component. This component was
 * made with 'react-hook-form' in mind, taking in 'react-hook-form' errors and mapping them to the given (non
 * extended) IPs. We might eventually try to completely remove the ExtendedIP type - see
 * https://github.com/linode/manager/pull/10968#discussion_r1800089369 for context
 */
export const MultipleNonExtendedIPInput = (props: Props) => {
  const { ipErrors, nonExtendedIPs, onNonExtendedIPChange, ...rest } = props;

  const extendedIPs: ExtendedIP[] =
    nonExtendedIPs.map((ip, idx) => {
      return {
        address: ip,
        error: ipErrors ? ipErrors[idx]?.message : '',
      };
    }) ?? [];

  return (
    <MultipleIPInput
      {...rest}
      ips={extendedIPs}
      onChange={(ips) => {
        const _ips = ips.map((ip) => {
          return ip.address;
        });
        onNonExtendedIPChange(_ips);
      }}
    />
  );
};
