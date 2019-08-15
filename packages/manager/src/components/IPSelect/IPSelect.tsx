import * as React from 'react';
import { compose } from 'recompose';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import withLinodes from 'src/containers/withLinodes.container';

interface Props {
  linodeId: number;
  value: Item<string>;
  handleChange: (ip: string) => void;
}

interface WithLinodesProps {
  linodesData: Linode.Linode[];
  linodesLoading: boolean;
  linodesError?: Linode.ApiFieldError[];
}

type CombinedProps = Props & WithLinodesProps;

const IPSelect: React.FC<CombinedProps> = props => {
  const {
    linodeId,
    value,
    handleChange,
    linodesData,
    linodesLoading,
    linodesError
  } = props;

  const thisLinode = linodesData.find(linode => linode.id === linodeId);
  const ips = thisLinode ? [...thisLinode.ipv4, thisLinode.ipv6] : [];

  const options: Item<string>[] = [
    {
      label: 'Any',
      value: 'any'
    },
    ...ips.map(ip => {
      const removedRange = removeRange(ip);
      return {
        label: removedRange,
        value: removedRange
      };
    })
  ];

  const errorText = linodesError
    ? 'There was an error retrieving your IP addresses.'
    : '';

  return (
    <Select
      value={options.find(option => option.value === value.value)}
      label="IP Address"
      options={options}
      isLoading={linodesLoading}
      onChange={(selected: Item<string>) => handleChange(selected.value)}
      errorText={errorText}
      isClearable={false}
    />
  );
};

const enhanced = compose<CombinedProps, Props>(
  withLinodes((ownProps, linodesData, linodesLoading, linodesError) => ({
    ...ownProps,
    linodesData,
    linodesLoading,
    linodesError
  }))
);

export default enhanced(IPSelect);

const removeRange = (ip: string) => ip.slice(0, ip.indexOf('/'));
