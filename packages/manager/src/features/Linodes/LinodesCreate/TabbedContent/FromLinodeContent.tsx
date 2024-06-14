import { Linode } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import VolumeIcon from 'src/assets/icons/entityIcons/volume.svg';
import { Paper } from 'src/components/Paper';
import { Placeholder } from 'src/components/Placeholder/Placeholder';
import { getIsDistributedRegion } from 'src/components/RegionSelect/RegionSelect.utils';
import { buildQueryStringForLinodeClone } from 'src/features/Linodes/LinodesLanding/LinodeActionMenu/LinodeActionMenuUtils';
import { useFlags } from 'src/hooks/useFlags';
import { extendType } from 'src/utilities/extendType';
import { getAPIErrorFor } from 'src/utilities/getAPIErrorFor';

import { SelectLinodePanel } from '../SelectLinodePanel/SelectLinodePanel';
import {
  CloneFormStateHandlers,
  ReduxStateProps,
  WithLinodesTypesRegionsAndImages,
} from '../types';
import { StyledGrid } from './CommonTabbedContent.styles';

const errorResources = {
  label: 'A label',
  region: 'region',
  root_pass: 'A root password',
  type: 'A plan selection',
};

export type CombinedProps = CloneFormStateHandlers &
  ReduxStateProps &
  WithLinodesTypesRegionsAndImages;

export const FromLinodeContent = (props: CombinedProps) => {
  const {
    errors,
    linodesData,
    regionsData,
    selectedLinodeID,
    typesData,
    updateLinodeID,
    updateTypeID,
    userCannotCreateLinode,
  } = props;

  const extendedTypes = typesData?.map(extendType);

  const hasErrorFor = getAPIErrorFor(errorResources, errors);

  const history = useHistory();

  const flags = useFlags();

  const updateSearchParams = (search: string) => {
    history.replace({ search });
  };

  /** Set the Linode ID and the disk size and reset the plan selection */
  const handleSelectLinode = (linodeId: number) => {
    const linode = props.linodesData.find(
      (eachLinode) => eachLinode.id === linodeId
    );

    if (linode) {
      updateLinodeID(linode.id, linode.specs.disk);
      updateTypeID(linode.type);
      updateSearchParams(
        buildQueryStringForLinodeClone(
          linode.id,
          linode.region,
          linode.type,
          extendedTypes,
          regionsData
        )
      );
    }
  };

  const filterDistributedRegionsLinodes = (linodes: Linode[]) =>
    linodes.filter(
      (linode) => !getIsDistributedRegion(regionsData, linode.region) // Hide linodes that are in a distributed region
    );

  const filteredLinodes = flags.gecko2?.enabled
    ? filterDistributedRegionsLinodes(linodesData)
    : linodesData;

  return (
    // eslint-disable-next-line
    <React.Fragment>
      {linodesData && linodesData.length === 0 ? (
        <StyledGrid>
          <Paper>
            <Placeholder
              data-qa-placeholder
              icon={VolumeIcon}
              isEntity
              renderAsSecondary
              title="Clone from Existing Linode"
            >
              You do not have any existing Linodes to clone from. Please first
              create a Linode from either an Image or StackScript.
            </Placeholder>
          </Paper>
        </StyledGrid>
      ) : (
        <StyledGrid>
          <SelectLinodePanel
            notices={[
              <>
                To help <strong>avoid data corruption</strong> during the
                cloning process, we recommend powering off your Compute Instance
                prior to cloning.
              </>,
              'This newly created Linode will be created with the same password and SSH Keys (if any) as the original Linode.',
            ]}
            data-qa-linode-panel
            disabled={userCannotCreateLinode}
            error={hasErrorFor('linode_id')}
            handleSelection={handleSelectLinode}
            header={'Select Linode to Clone From'}
            linodes={filteredLinodes}
            selectedLinodeID={selectedLinodeID}
            showPowerActions
          />
        </StyledGrid>
      )}
    </React.Fragment>
  );
};
