import { pathOr } from 'ramda';
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
import { renderBackupsDisplaySection } from './utils';

import { extendLinodes } from '../utilities';

import {
  CloneFormStateHandlers,
  ReduxStatePropsAndSSHKeys,
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
  ReduxStatePropsAndSSHKeys;

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

  cloneLinode = () => {
    return this.props.handleSubmitForm(
      {
        region: this.props.selectedRegionID,
        type: this.props.selectedTypeID,
        label: this.props.label,
        private_ip: this.props.privateIPEnabled,
        backups_enabled: this.props.backupsEnabled,
        tags: this.props.tags ? this.props.tags.map(item => item.value) : []
      },
      this.props.selectedLinodeID
    );
  };

  render() {
    const {
      classes,
      errors,
      accountBackupsEnabled,
      backupsEnabled,
      userCannotCreateLinode,
      linodesData: linodes,
      imagesData: images,
      typesData: types,
      regionDisplayInfo: regionInfo,
      typeDisplayInfo: typeInfo,
      selectedLinodeID
    } = this.props;

    const hasErrorFor = getAPIErrorsFor(errorResources, errors);

    const hasBackups = backupsEnabled || accountBackupsEnabled;

    const displaySections = [];
    if (regionInfo) {
      displaySections.push({
        title: regionInfo.title,
        details: regionInfo.details
      });
    }

    if (typeInfo) {
      displaySections.push(typeInfo);
    }

    // if (label) {
    //   displaySections.push({
    //     title: 'Linode Label',
    //     details: label
    //   });
    // }

    if (hasBackups && typeInfo && typeInfo.backupsMonthly) {
      displaySections.push(
        renderBackupsDisplaySection(
          accountBackupsEnabled,
          typeInfo.backupsMonthly
        )
      );
    }

    // let calculatedPrice = pathOr(0, ['monthly'], typeInfo);
    // if (hasBackups && typeInfo && typeInfo.backupsMonthly) {
    //   calculatedPrice += typeInfo.backupsMonthly;
    // }

    return (
      // eslint-disable-next-line
      <React.Fragment>
        {linodes && linodes.length === 0 ? (
          <Grid
            item
            className={`${classes.main} mlMain py0`}
            id="tabpanel-clone-create"
            role="tabpanel"
            aria-labelledby="tab-clone-create"
          >
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
              {/* <SelectRegionPanel
                data-qa-region-panel
                error={hasErrorFor('region')}
                regions={regions}
                handleSelection={this.props.updateRegionID}
                selectedID={selectedRegionID}
                copy="Determine the best location for your Linode."
                updateFor={[selectedRegionID, errors, regions]}
                helperText={this.props.regionHelperText}
                disabled={userCannotCreateLinode}
              /> */}
              {/* <SelectPlanPanel
                data-qa-select-plan-panel
                error={hasErrorFor('type')}
                types={types}
                onSelect={this.props.updateTypeID}
                selectedID={selectedTypeID}
                selectedDiskSize={selectedDiskSize}
                updateFor={[
                  selectedDiskSize,
                  selectedTypeID,
                  errors,
                  this.props.disabledClasses
                ]}
                disabled={userCannotCreateLinode}
                disabledClasses={this.props.disabledClasses}
              />
              <LabelAndTagsPanel
                data-qa-label-panel
                labelFieldProps={{
                  label: 'Linode Label',
                  value: label || '',
                  onChange: this.props.updateLabel,
                  errorText: hasErrorFor('label'),
                  disabled: userCannotCreateLinode
                }}
                updateFor={[label, errors]}
              /> */}
            </Grid>
            {/* <Grid item className={`${classes.sidebar} mlSidebar`}>
              <CheckoutBar
                heading="Linode Summary"
                calculatedPrice={calculatedPrice}
                isMakingRequest={this.props.formIsSubmitting}
                disabled={this.props.formIsSubmitting || userCannotCreateLinode}
                onDeploy={this.cloneLinode}
              >
                <DisplaySectionList displaySections={displaySections} />
              </CheckoutBar>
            </Grid> */}
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default styled(FromLinodeContent);
