import * as React from 'react';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { useLinodeQuery } from 'src/queries/linodes/linodes';

interface Props {
  linodeId: number;
  value: Item<string>;
  handleChange: (ip: string) => void;
  customizeOptions?: (options: Item<string>[]) => Item<string>[];
  errorText?: string;
}

export const IPSelect = (props: Props) => {
  const { linodeId, value, handleChange, customizeOptions } = props;

  const { data: linode, isLoading, error } = useLinodeQuery(linodeId);

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
  let options: Item<string>[] = ips.map((ip) => ({ value: ip, label: ip }));

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
      value={options.find((option) => option.value === value.value)}
      label="IP Address"
      options={options}
      isLoading={isLoading}
      onChange={(selected) => handleChange(selected.value)}
      errorText={errorText}
      isClearable={false}
      placeholder="Select an IP Address..."
    />
  );
};
