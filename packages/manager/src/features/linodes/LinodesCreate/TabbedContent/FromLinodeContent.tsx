import * as React from 'react';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import CreateLinodeDisabled from 'src/components/CreateLinodeDisabled';
import Grid from 'src/components/Grid';
import Placeholder from 'src/components/Placeholder';

import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import SelectLinodePanel from '../SelectLinodePanel';

import { extendLinodes } from '../utilities';

import {
  CloneFormStateHandlers,
  ReduxStateProps,
  WithDisplayData,
  WithLinodesTypesRegionsAndImages
} from '../types';

type ClassNames = 'root' | 'main' | 'sidebar';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    main: {
      [theme.breakpoints.up('md')]: {
        maxWidth: '100%'
      }
    },
    sidebar: {
      [theme.breakpoints.up('md')]: {
        marginTop: '-130px !important'
      }
    }
  });

const errorResources = {
  type: 'A plan selection',
  region: 'region',
  label: 'A label',
  root_pass: 'A root password'
};

export type CombinedProps = WithStyles<ClassNames> &
  WithDisplayData &
  CloneFormStateHandlers &
  WithLinodesTypesRegionsAndImages &
  ReduxStateProps;

export class FromLinodeContent extends React.PureComponent<CombinedProps> {
  /** set the Linode ID and the disk size and reset the plan selection */
  handleSelectLinode = (linodeID: number) => {
    const linode = this.props.linodesData.find(
      eachLinode => eachLinode.id === linodeID
    );
    if (linode) {
      this.props.updateLinodeID(linode.id, linode.specs.disk);
    }
  };

  render() {
    const {
      classes,
      errors,
      userCannotCreateLinode,
      linodesData: linodes,
      imagesData: images,
      typesData: types,
      selectedLinodeID
    } = this.props;

    const hasErrorFor = getAPIErrorsFor(errorResources, errors);

    return (
      // eslint-disable-next-line
      <React.Fragment>
        {linodes && linodes.length === 0 ? (
          <Grid item className={`${classes.main} mlMain py0`}>
            <Paper>
              <Placeholder
                data-qa-placeholder
                icon={VolumeIcon}
                renderAsSecondary
                copy="You do not have any existing Linodes to clone from.
                    Please first create a Linode from either an Image or StackScript."
                title="Clone from Existing Linode"
              />
            </Paper>
          </Grid>
        ) : (
          <React.Fragment>
            <Grid item className={`${classes.main} mlMain py0`}>
              <CreateLinodeDisabled isDisabled={userCannotCreateLinode} />
              <SelectLinodePanel
                data-qa-linode-panel
                error={hasErrorFor('linode_id')}
                linodes={extendLinodes(linodes, images, types)}
                selectedLinodeID={selectedLinodeID}
                header={'Select Linode to Clone From'}
                handleSelection={this.handleSelectLinode}
                updateFor={[selectedLinodeID, errors]}
                disabled={userCannotCreateLinode}
                notice={{
                  level: 'warning',
                  text: `This newly created Linode will be created with
                          the same password and SSH Keys (if any) as the original Linode.`
                }}
              />
            </Grid>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default styled(FromLinodeContent);
