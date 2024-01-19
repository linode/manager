import * as React from 'react';
import { useHistory } from 'react-router-dom';

import VolumeIcon from 'src/assets/icons/entityIcons/volume.svg';
import { Paper } from 'src/components/Paper';
import { Placeholder } from 'src/components/Placeholder/Placeholder';
import { buildQueryStringForLinodeClone } from 'src/features/Linodes/LinodesLanding/LinodeActionMenu';
import { useFlags } from 'src/hooks/useFlags';
import { extendType } from 'src/utilities/extendType';
import { getAPIErrorFor } from 'src/utilities/getAPIErrorFor';

import SelectLinodePanel from '../SelectLinodePanel';
import {
  CloneFormStateHandlers,
  ReduxStateProps,
  WithLinodesTypesRegionsAndImages,
} from '../types';
import { extendLinodes } from '../utilities';
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
    imagesData,
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
  const handleSelectLinode = (linodeID: number, type: null | string) => {
    const linode = props.linodesData.find(
      (eachLinode) => eachLinode.id === linodeID
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
            linodes={extendLinodes(
              linodesData,
              imagesData,
              extendedTypes,
              regionsData
            )}
            notices={[
              {
                level: 'warning',
                text:
                  'This newly created Linode will be created with the same password and SSH Keys (if any) as the original Linode.',
              },
              ...(flags.linodeCloneUIChanges
                ? [
                    {
                      level: 'warning' as const,
                      text:
                        'To help avoid data corruption during the cloning process, we recommend powering off your Compute Instance prior to cloning.',
                    },
                  ]
                : []),
            ]}
            data-qa-linode-panel
            disabled={userCannotCreateLinode}
            error={hasErrorFor('linode_id')}
            handleSelection={handleSelectLinode}
            header={'Select Linode to Clone From'}
            selectedLinodeID={selectedLinodeID}
            updateFor={[selectedLinodeID, errors]}
          />
        </StyledGrid>
      )}
    </React.Fragment>
  );
};
