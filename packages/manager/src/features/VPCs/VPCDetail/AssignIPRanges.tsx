import * as React from 'react';

import { Divider } from 'src/components/Divider';
import { Link } from 'src/components/Link';
import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import {
  ASSIGN_IPV4_RANGES_DESCRIPTION,
  ASSIGN_IPV4_RANGES_TITLE,
} from 'src/features/VPCs/constants';
import { ExtendedIP } from 'src/utilities/ipUtils';

interface Props {
  handleIPRangeChange: (ips: ExtendedIP[]) => void;
  ipRanges: ExtendedIP[];
  ipRangesError?: string;
}

export const AssignIPRanges = (props: Props) => {
  const { handleIPRangeChange, ipRanges, ipRangesError } = props;

  return (
    <>
      <Divider />
      {ipRangesError && (
        <Notice important text={ipRangesError} variant="error" />
      )}
      <Typography sx={(theme) => ({ fontFamily: theme.font.bold })}>
        {ASSIGN_IPV4_RANGES_TITLE}
      </Typography>
      <Typography variant="body1">
        {ASSIGN_IPV4_RANGES_DESCRIPTION}{' '}
        <Link to="https://www.linode.com/docs/guides/how-to-understand-ip-addresses/">
          Learn more
        </Link>
        .
      </Typography>
      <MultipleIPInput
        buttonText="Add IPv4 Ranges"
        forVPCIPv4Ranges
        ips={ipRanges}
        onChange={handleIPRangeChange}
        placeholder="IPv4 range address format, e.g. 10.0.0.0/24"
        title=""
      />
    </>
  );
};
