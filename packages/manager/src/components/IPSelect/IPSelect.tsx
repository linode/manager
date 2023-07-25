import * as React from 'react';

import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { useLinodeQuery } from 'src/queries/linodes/linodes';

interface Props {
  customizeOptions?: (options: Item<string>[]) => Item<string>[];
  errorText?: string;
  handleChange: (ip: string) => void;
  linodeId: number;
  value: Item<string>;
}

export const IPSelect = (props: Props) => {
  const { customizeOptions, handleChange, linodeId, value } = props;

  const { data: linode, error, isLoading } = useLinodeQuery(linodeId);

  const ips: string[] = [];

  // If we have a Linode (from Redux) matching the given ID, use it's IPv4 address(es).
  if (linode) {
    ips.push(...linode.ipv4);

    // If the Linode has an IPv6 address, use it as well.
    if (linode.ipv6) {
      ips.push(linode.ipv6);
    }
  }

  // Create React-Select-friendly options.
  let options: Item<string>[] = ips.map((ip) => ({ label: ip, value: ip }));

  // If a customizeOptions function was provided, apply it here.
  if (customizeOptions) {
    options = customizeOptions(options);
  }

  let errorText = '';

  if (props.errorText) {
    errorText = props.errorText;
  } else if (error) {
    errorText =
      'There was an error retrieving this Linode\u{2019}s IP addresses.';
  }

  return (
    <Select
      errorText={errorText}
      isClearable={false}
      isLoading={isLoading}
      label="IP Address"
      onChange={(selected) => handleChange(selected.value)}
      options={options}
      placeholder="Select an IP Address..."
      value={options.find((option) => option.value === value.value)}
    />
  );
};
