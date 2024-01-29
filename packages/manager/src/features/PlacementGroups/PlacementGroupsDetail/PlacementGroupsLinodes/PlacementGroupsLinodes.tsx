import * as React from 'react';

import { Button } from 'src/components/Button/Button';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';

import { PlacementGroupsLinodesTable } from './PlacementGroupsLinodesTable';

import type { Linode, PlacementGroup } from '@linode/api-v4';

interface Props {
  placementGroup: PlacementGroup | undefined;
}

export const PlacementGroupsLinodes = (props: Props) => {
  const { placementGroup } = props;
  const { data: allLinodes } = useAllLinodesQuery();
  const [searchText, setSearchText] = React.useState('');
  const [filteredLinodes, setFilteredLinodes] = React.useState<Linode[]>([]);

  const placementGroupLinodes = allLinodes?.filter((linode: Linode) => {
    return placementGroup?.linode_ids.includes(linode.id);
  });

  React.useEffect(() => {
    setFilteredLinodes(placementGroupLinodes || []);
  }, [allLinodes]);

  if (!placementGroup) {
    return null;
  }

  const { limits } = placementGroup; // TODO VM_Placement - this will be "capacity" once M3-7614 is merged

  const filter = (value: string) => {
    setSearchText(value);
    const filtered = placementGroupLinodes?.filter((linode: Linode) => {
      return linode.label.toLowerCase().includes(value.toLowerCase());
    });
    setFilteredLinodes(filtered ?? []);
  };

  return (
    <Stack spacing={2}>
      <Typography>
        The following Linodes have been assigned to this Placement Group. A
        Linode can only be assigned to a single Placement Group. <br />
        Limit of Linodes for this Placement Group: {limits}
      </Typography>

      <DebouncedSearchTextField
        onSearch={(value) => {
          filter(value);
        }}
        debounceTime={400}
        expand={true}
        hideLabel
        label=""
        placeholder={`Search Linodes`}
        value={searchText}
      />

      <Button
        buttonType="primary"
        data-testid="add-device-button"
        // disabled={disabled}
        // onClick={handleOpen}
      >
        Add Linode to Placement Group
      </Button>

      <PlacementGroupsLinodesTable error={[]} linodes={filteredLinodes || []} />
      {/* ADD LINODES DRAWER */}
      {/* UNASSIGN LINODE DRAWER */}
    </Stack>
  );
};
