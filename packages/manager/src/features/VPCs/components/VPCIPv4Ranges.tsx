import { Spacing } from '@akamai/cds-tokens';
import * as React from 'react';

import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';

import type { VPCIPv4Range } from '@linode/api-v4';

interface Props {
  /**
   * Disables the inputs.
   */
  disabled?: boolean;

  /**
   * Field-level error message shown above the inputs.
   */
  error?: string;

  /**
   * Called when a range input loses focus (useful for triggering validation).
   */
  onBlur?: () => void;

  /**
   * Called with the updated list of ranges whenever an input changes.
   */
  onChange: (ranges: VPCIPv4Range[]) => void;

  /**
   * Marks the field as optional.
   */
  optional?: boolean;

  /**
   * Per-range error messages, aligned by index with `ranges`.
   */
  rangeErrors?: (string | undefined)[];

  /**
   * The current list of custom VPC IPv4 ranges (CIDRs).
   */
  ranges: VPCIPv4Range[];
}

/**
 * Renders a variable number of custom IPv4 Range (CIDR) inputs for a VPC.
 *
 * The user can specify one or more CIDRs that apply to the whole VPC.
 *
 * Shared between the VPC Create flow and the Edit VPC drawer (which prefills
 * `ranges` from the API response).
 */
export const VPCIPv4Ranges = (props: Props) => {
  const { disabled, error, onBlur, onChange, optional, rangeErrors, ranges } =
    props;

  // Always show at least one input so the user has an empty field to fill in.
  const displayRanges: VPCIPv4Range[] =
    ranges.length > 0 ? ranges : [{ range: '' }];

  return (
    <MultipleIPInput
      buttonText="Add IPv4 Range"
      disabled={disabled}
      error={error}
      forVPCIPRanges
      ips={displayRanges.map((ipv4, index) => ({
        address: ipv4.range ?? '',
        error: rangeErrors?.[index],
      }))}
      onBlur={(ips) => {
        onChange(ips.map((ip) => ({ range: ip.address })));
        onBlur?.();
      }}
      onChange={(ips) => onChange(ips.map((ip) => ({ range: ip.address })))}
      optional={optional}
      placeholder="Enter IPv4 Range"
      title="VPC IPv4 Range (CIDR)"
      tooltip={
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: Spacing.S16,
          }}
        >
          <p style={{ margin: 0 }}>
            Add upto 30 canonical CIDR ranges with prefixes from /5 to /30.
          </p>
          <p style={{ margin: 0 }}>
            Unused fields will default to standard RFC 1918 ranges: 10.0.0.0/8,
            172.16.0.0/12 or 192.168.0.0/16.
          </p>
          <p style={{ margin: 0 }}>
            Reserved ranges, including 192.168.128.0/17, as well as loopback,
            multicast, and Akamai-owned IP addresses are not allowed.
          </p>
        </div>
      }
    />
  );
};
