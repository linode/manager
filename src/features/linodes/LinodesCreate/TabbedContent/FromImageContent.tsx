import { pathOr } from 'ramda';
import * as React from 'react';
import { Sticky, StickyProps } from 'react-sticky';
import { compose } from 'recompose';
import AccessPanel from 'src/components/AccessPanel';
import CheckoutBar from 'src/components/CheckoutBar';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import CreateLinodeDisabled from 'src/components/CreateLinodeDisabled';
import Grid from 'src/components/Grid';
import LabelAndTagsPanel from 'src/components/LabelAndTagsPanel';
import Notice from 'src/components/Notice';
import SelectRegionPanel from 'src/components/SelectRegionPanel';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import AddonsPanel from '../AddonsPanel';
import SelectImagePanel from '../SelectImagePanel';
import SelectPlanPanel from '../SelectPlanPanel';
import { renderBackupsDisplaySection } from './utils';

import { BaseFormStateAndHandlers, WithAll, WithDisplayData } from '../types';

type ClassNames = 'root' | 'main' | 'sidebar';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  main: {},
  sidebar: {
    [theme.breakpoints.up('lg')]: {
      marginTop: -130
    }
  }
});

interface Notice {
  text: string;
  level: 'warning' | 'error'; // most likely only going to need these two
}

interface Props extends BaseFormStateAndHandlers {
  notice?: Notice;
  variant?: 'public'| 'private'| 'all';
  imagePanelTitle?: string;
}

/**
 * image, region, type, label, backups, privateIP, tags, error, isLoading,
 */

const errorResources = {
  type: 'A plan selection',
  region: 'A region selection',
  label: 'A label',
  root_pass: 'A root password',
  image: 'Image',
  tags: 'Tags'
};

type CombinedProps = Props &
  WithStyles<ClassNames> &
  WithDisplayData &
  BaseFormStateAndHandlers &
  WithAll;

export class FromImageContent extends React.PureComponent<CombinedProps> {
  /** create the Linode */
  createLinode = () => {
    this.props.handleSubmitForm('create', {
      type: this.props.selectedTypeID,
      region: this.props.selectedRegionID,
      image: this.props.selectedImageID,
      root_pass: this.props.password,
      tags: this.props.tags
        ? this.props.tags.map(eachTag => eachTag.label)
        : [],
      backups_enabled: this.props.backupsEnabled,
      booted: true,
      label: this.props.label,
      private_ip: this.props.privateIPEnabled,
      authorized_users: this.props.userSSHKeys
        .filter(u => u.selected)
        .map(u => u.username)
    });
  };

  render() {
    const {
      accountBackupsEnabled,
      classes,
      notice,
      typesData: types,
      regionsData: regions,
      imagesData: images,
      imageDisplayInfo,
      regionDisplayInfo,
      typeDisplayInfo,
      backupsMonthlyPrice,
      userSSHKeys,
      userCannotCreateLinode,
      errors,
      imagePanelTitle,
      variant
    } = this.props;

    const hasErrorFor = getAPIErrorsFor(errorResources, errors);
    const generalError = hasErrorFor('none');

    const hasBackups = this.props.backupsEnabled || accountBackupsEnabled;

    return (
      <React.Fragment>
        <Grid item className={`${classes.main} mlMain`}>
          {notice && (
            <Notice
              text={notice.text}
              error={notice.level === 'error'}
              warning={notice.level === 'warning'}
            />
          )}
          <CreateLinodeDisabled isDisabled={userCannotCreateLinode} />
          {generalError && <Notice text={generalError} error={true} />}
          <SelectImagePanel
            variant={variant}
            title={imagePanelTitle}
            images={images}
            handleSelection={this.props.updateImageID}
            selectedImageID={this.props.selectedImageID}
            updateFor={[this.props.selectedImageID, errors]}
            initTab={0}
            error={hasErrorFor('image')}
            disabled={userCannotCreateLinode}
          />
          <SelectRegionPanel
            error={hasErrorFor('region')}
            regions={regions}
            handleSelection={this.props.updateRegionID}
            selectedID={this.props.selectedRegionID}
            copy="Determine the best location for your Linode."
            updateFor={[this.props.selectedRegionID, errors]}
            disabled={userCannotCreateLinode}
          />
          <SelectPlanPanel
            error={hasErrorFor('type')}
            types={types}
            onSelect={this.props.updateTypeID}
            selectedID={this.props.selectedTypeID}
            updateFor={[this.props.selectedTypeID, errors]}
            disabled={userCannotCreateLinode}
          />
          <LabelAndTagsPanel
            labelFieldProps={{
              label: 'Linode Label',
              value: this.props.label || '',
              onChange: this.props.updateLabel,
              errorText: hasErrorFor('label'),
              disabled: userCannotCreateLinode
            }}
            tagsInputProps={{
              value: this.props.tags || [],
              onChange: this.props.updateTags,
              tagError: hasErrorFor('tags'),
              disabled: userCannotCreateLinode
            }}
            updateFor={[this.props.tags, this.props.label, errors]}
          />
          <AccessPanel
            /* disable the password field if we haven't selected an image */
            disabled={!this.props.selectedImageID}
            disabledReason={
              !this.props.selectedImageID
                ? 'You must select an image to set a root password'
                : ''
            }
            error={hasErrorFor('root_pass')}
            password={this.props.password}
            handleChange={this.props.updatePassword}
            updateFor={[
              this.props.password,
              errors,
              userSSHKeys,
              this.props.selectedImageID
            ]}
            users={
              userSSHKeys.length > 0 && this.props.selectedImageID
                ? userSSHKeys
                : []
            }
          />
          <AddonsPanel
            backups={this.props.backupsEnabled}
            accountBackups={this.props.accountBackupsEnabled}
            backupsMonthly={backupsMonthlyPrice}
            privateIP={this.props.privateIPEnabled}
            changeBackups={this.props.toggleBackupsEnabled}
            changePrivateIP={this.props.togglePrivateIPEnabled}
            updateFor={[
              this.props.privateIPEnabled,
              this.props.backupsEnabled,
              this.props.selectedTypeID
            ]}
            disabled={userCannotCreateLinode}
          />
        </Grid>
        <Grid item className={`${classes.sidebar} mlSidebar`}>
          <Sticky topOffset={-24} disableCompensation>
            {(props: StickyProps) => {
              const displaySections = [];
              if (imageDisplayInfo) {
                displaySections.push(imageDisplayInfo);
              }

              if (regionDisplayInfo) {
                displaySections.push({
                  title: regionDisplayInfo.title,
                  details: regionDisplayInfo.details
                });
              }

              if (typeDisplayInfo) {
                displaySections.push(typeDisplayInfo);
              }

              if (
                hasBackups &&
                typeDisplayInfo &&
                typeDisplayInfo.backupsMonthly
              ) {
                displaySections.push(
                  renderBackupsDisplaySection(
                    accountBackupsEnabled,
                    typeDisplayInfo.backupsMonthly
                  )
                );
              }

              let calculatedPrice = pathOr(0, ['monthly'], typeDisplayInfo);
              if (
                hasBackups &&
                typeDisplayInfo &&
                typeDisplayInfo.backupsMonthly
              ) {
                calculatedPrice += typeDisplayInfo.backupsMonthly;
              }

              return (
                <CheckoutBar
                  heading={`${this.props.label || 'Linode'} Summary`}
                  calculatedPrice={calculatedPrice}
                  isMakingRequest={this.props.formIsSubmitting}
                  disabled={
                    this.props.formIsSubmitting || userCannotCreateLinode
                  }
                  onDeploy={this.createLinode}
                  displaySections={displaySections}
                  {...props}
                />
              );
            }}
          </Sticky>
        </Grid>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props & WithDisplayData & WithAll>(
  styled
);

export default enhanced(FromImageContent);
