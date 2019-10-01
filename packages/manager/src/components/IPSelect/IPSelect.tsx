import { Linode } from 'linode-js-sdk/lib/linodes';
import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import { compose } from 'recompose';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import withLinodes from 'src/containers/withLinodes.container';

interface Props {
  linodeId: number;
  value: Item<string>;
  handleChange: (ip: string) => void;
  customizeOptions?: (options: Item<string>[]) => Item<string>[];
  errorText?: string;
}

interface WithLinodesProps {
  linode?: Linode;
  linodesLoading: boolean;
  linodesError?: APIError[];
}

type CombinedProps = Props & WithLinodesProps;

const IPSelect: React.FC<CombinedProps> = props => {
  const {
    linode,
    value,
    handleChange,
    linodesLoading,
    linodesError,
    customizeOptions
  } = props;

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
  let options: Item<string>[] = ips.map(ip => ({ value: ip, label: ip }));

  // If a customizeOptions function was provided, apply it here.
  if (customizeOptions) {
    options = customizeOptions(options);
  }

  let errorText = '';

  if (props.errorText) {
    errorText = props.errorText;
  } else if (linodesError) {
    errorText = "There was an error retrieving this Linode's IP addresses.";
  }

  return (
    <Select
      value={options.find(option => option.value === value.value)}
      label="IP Address"
      options={options}
      isLoading={linodesLoading}
      onChange={(selected: Item<string>) => handleChange(selected.value)}
      errorText={errorText}
      isClearable={false}
      placeholder="Select an IP Address..."
    />
  );
};

const enhanced = compose<CombinedProps, Props>(
  withLinodes<WithLinodesProps, Props>(
    (ownProps, linodesData, linodesLoading, linodesError) => ({
      ...ownProps,
      // Find the Linode in Redux that corresponds with the given ID.
      linode: linodesData.find(linode => linode.id === ownProps.linodeId),
      linodesLoading,
      linodesError
    })
  )
);

export default enhanced(IPSelect);
