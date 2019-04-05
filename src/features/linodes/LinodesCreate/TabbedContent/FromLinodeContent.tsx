import { pathOr } from 'ramda';
import * as React from 'react';
import { Sticky, StickyProps } from 'react-sticky';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';
import CheckoutBar from 'src/components/CheckoutBar';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import CreateLinodeDisabled from 'src/components/CreateLinodeDisabled';
import Grid from 'src/components/Grid';
import LabelAndTagsPanel from 'src/components/LabelAndTagsPanel';
import Placeholder from 'src/components/Placeholder';
import SelectRegionPanel from 'src/components/SelectRegionPanel';

import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import AddonsPanel from '../AddonsPanel';
import SelectLinodePanel from '../SelectLinodePanel';
import SelectPlanPanel from '../SelectPlanPanel';
import { renderBackupsDisplaySection } from './utils';

import { extendLinodes } from '../utilities';

import {
  CloneFormStateHandlers,
  ReduxStatePropsAndSSHKeys,
  WithDisplayData,
  WithLinodesTypesRegionsAndImages
} from '../types';

type ClassNames = 'root' | 'main' | 'sidebar';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  main: {},
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
      'clone',
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
      backupsMonthlyPrice,
      userCannotCreateLinode,
      linodesData: linodes,
      imagesData: images,
      typesData: types,
      regionsData: regions,
      regionDisplayInfo: regionInfo,
      typeDisplayInfo: typeInfo,
      selectedTypeID,
      privateIPEnabled,
      selectedRegionID,
      selectedLinodeID,
      selectedDiskSize,
      label
    } = this.props;

    const hasErrorFor = getAPIErrorsFor(errorResources, errors);

    const hasBackups = backupsEnabled || accountBackupsEnabled;

    return (
      <React.Fragment>
        {linodes && linodes.length === 0 ? (
          <Grid item className={`${classes.main} mlMain py0`}>
            <Paper>
              <Placeholder
                icon={VolumeIcon}
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
              <SelectRegionPanel
                error={hasErrorFor('region')}
                regions={regions}
                handleSelection={this.props.updateRegionID}
                selectedID={selectedRegionID}
                copy="Determine the best location for your Linode."
                updateFor={[selectedRegionID, errors]}
                disabled={userCannotCreateLinode}
              />
              <SelectPlanPanel
                error={hasErrorFor('type')}
                types={types}
                onSelect={this.props.updateTypeID}
                selectedID={selectedTypeID}
                selectedDiskSize={selectedDiskSize}
                updateFor={[selectedDiskSize, selectedTypeID, errors]}
                disabled={userCannotCreateLinode}
              />
              <LabelAndTagsPanel
                labelFieldProps={{
                  label: 'Linode Label',
                  value: label || '',
                  onChange: this.props.updateLabel,
                  errorText: hasErrorFor('label'),
                  disabled: userCannotCreateLinode
                }}
                updateFor={[label, errors]}
              />
              <AddonsPanel
                backups={backupsEnabled}
                accountBackups={accountBackupsEnabled}
                backupsMonthly={backupsMonthlyPrice}
                privateIP={privateIPEnabled}
                changeBackups={this.props.toggleBackupsEnabled}
                changePrivateIP={this.props.togglePrivateIPEnabled}
                updateFor={[privateIPEnabled, backupsEnabled, selectedTypeID]}
                disabled={userCannotCreateLinode}
              />
            </Grid>
            <Grid item className={`${classes.sidebar} mlSidebar`}>
              <Sticky topOffset={-24} disableCompensation>
                {(props: StickyProps) => {
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

                  if (label) {
                    displaySections.push({
                      title: 'Linode Label',
                      details: label
                    });
                  }

                  if (hasBackups && typeInfo && typeInfo.backupsMonthly) {
                    displaySections.push(
                      renderBackupsDisplaySection(
                        accountBackupsEnabled,
                        typeInfo.backupsMonthly
                      )
                    );
                  }

                  let calculatedPrice = pathOr(0, ['monthly'], typeInfo);
                  if (hasBackups && typeInfo && typeInfo.backupsMonthly) {
                    calculatedPrice += typeInfo.backupsMonthly;
                  }

                  return (
                    <CheckoutBar
                      heading="Linode Summary"
                      calculatedPrice={calculatedPrice}
                      isMakingRequest={this.props.formIsSubmitting}
                      disabled={
                        this.props.formIsSubmitting || userCannotCreateLinode
                      }
                      onDeploy={this.cloneLinode}
                      displaySections={displaySections}
                      {...props}
                    />
                  );
                }}
              </Sticky>
            </Grid>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default styled(FromLinodeContent);
