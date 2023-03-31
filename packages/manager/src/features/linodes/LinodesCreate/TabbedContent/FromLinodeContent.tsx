import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import VolumeIcon from 'src/assets/icons/entityIcons/volume.svg';
import Paper from 'src/components/core/Paper';
import Grid from 'src/components/Grid';
import Placeholder from 'src/components/Placeholder';
import { buildQueryStringForLinodeClone } from 'src/features/linodes/LinodesLanding/LinodeActionMenu';
import { extendType } from 'src/utilities/extendType';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import SelectLinodePanel from '../SelectLinodePanel';
import {
  CloneFormStateHandlers,
  ReduxStateProps,
  WithLinodesTypesRegionsAndImages,
} from '../types';
import { extendLinodes } from '../utilities';

const useStyles = makeStyles((theme: Theme) => ({
  main: {
    [theme.breakpoints.up('md')]: {
      maxWidth: '100%',
    },
  },
}));

const errorResources = {
  type: 'A plan selection',
  region: 'region',
  label: 'A label',
  root_pass: 'A root password',
};

export type CombinedProps = CloneFormStateHandlers &
  ReduxStateProps &
  WithLinodesTypesRegionsAndImages;

export const FromLinodeContent: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const {
    errors,
    imagesData,
    linodesData,
    typesData,
    regionsData,
    selectedLinodeID,
    userCannotCreateLinode,
    updateLinodeID,
    updateTypeID,
  } = props;

  const extendedTypes = typesData?.map(extendType);

  const hasErrorFor = getAPIErrorsFor(errorResources, errors);

  const history = useHistory();

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
        <Grid item className={`${classes.main} mlMain py0`}>
          <Paper>
            <Placeholder
              data-qa-placeholder
              isEntity
              icon={VolumeIcon}
              renderAsSecondary
              title="Clone from Existing Linode"
            >
              You do not have any existing Linodes to clone from. Please first
              create a Linode from either an Image or StackScript.
            </Placeholder>
          </Paper>
        </Grid>
      ) : (
        <Grid item className={`${classes.main} mlMain py0`}>
          <SelectLinodePanel
            data-qa-linode-panel
            error={hasErrorFor('linode_id')}
            linodes={extendLinodes(
              linodesData,
              imagesData,
              extendedTypes,
              regionsData
            )}
            selectedLinodeID={selectedLinodeID}
            header={'Select Linode to Clone From'}
            handleSelection={handleSelectLinode}
            updateFor={[selectedLinodeID, errors]}
            disabled={userCannotCreateLinode}
            notice={{
              level: 'warning',
              text: `This newly created Linode will be created with the same password and SSH Keys (if any) as the original Linode.`,
            }}
          />
        </Grid>
      )}
    </React.Fragment>
  );
};

export default FromLinodeContent;
