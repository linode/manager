import { pathOr } from 'ramda';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Sticky, StickyProps } from 'react-sticky';
import AccessPanel from 'src/components/AccessPanel';
import CheckoutBar from 'src/components/CheckoutBar';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import CreateLinodeDisabled from 'src/components/CreateLinodeDisabled';
import Grid from 'src/components/Grid';
import LabelAndTagsPanel from 'src/components/LabelAndTagsPanel';
import Notice from 'src/components/Notice';
import Placeholder from 'src/components/Placeholder';
import SelectRegionPanel from 'src/components/SelectRegionPanel';
import { getErrorMap } from 'src/utilities/errorUtils';
import AddonsPanel from '../AddonsPanel';
import SelectImagePanel from '../SelectImagePanel';
import SelectPlanPanel from '../SelectPlanPanel';
import { renderBackupsDisplaySection } from './utils';

import {
  BaseFormStateAndHandlers,
  ReduxStatePropsAndSSHKeys,
  WithDisplayData,
  WithTypesRegionsAndImages
} from '../types';

type ClassNames = 'root' | 'main' | 'sidebarPrivate' | 'sidebarPublic';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    main: {},
    sidebarPrivate: {
      [theme.breakpoints.up('md')]: {
        marginTop: '-130px !important'
      }
    },
    sidebarPublic: {
      [theme.breakpoints.up('md')]: {
        marginTop: '0 !important'
      }
    }
  });

interface Props extends BaseFormStateAndHandlers {
  variant?: 'public' | 'private' | 'all';
  imagePanelTitle?: string;
  showGeneralError?: boolean;
}

const errorMap = [
  'backup_id',
  'linode_id',
  'stackscript_id',
  'region',
  'type',
  'root_pass',
  'label',
  'image'
];

export type CombinedProps = Props &
  WithStyles<ClassNames> &
  WithDisplayData &
  WithTypesRegionsAndImages &
  ReduxStatePropsAndSSHKeys &
  BaseFormStateAndHandlers;

export class FromImageContent extends React.PureComponent<CombinedProps> {
  /** create the Linode */
  createLinode = () => {
    this.props.handleSubmitForm({
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
      typesData: types,
      regionsData: regions,
      imagesData: images,
      imageDisplayInfo,
      regionDisplayInfo,
      typeDisplayInfo,
      backupsMonthlyPrice,
      userSSHKeys,
      sshError,
      requestKeys,
      userCannotCreateLinode,
      errors,
      imagePanelTitle,
      showGeneralError,
      variant
    } = this.props;

    const hasBackups = this.props.backupsEnabled || accountBackupsEnabled;
    const privateImages = images.filter(image => !image.is_public);

    if (variant === 'private' && privateImages.length === 0) {
      return (
        <Grid item className={`${classes.main} mlMain py0`}>
          <Paper>
            <Placeholder
              title="My Images"
              copy={
                <Typography variant="subtitle1">
                  You don't have any private Images. Visit the{' '}
                  <Link to="/images">Images section</Link> to create an Image
                  from one of your Linode's disks.
                </Typography>
              }
            />
          </Paper>
        </Grid>
      );
    }

    /**
     * subtab component handles displaying general errors internally, but the
     * issue here is that the FromImageContent isn't nested under
     * sub-tabs, so we need to display general errors here
     *
     * NOTE: This only applies to from Distro; "My Images" must be handled
     * separately.
     */
    const hasErrorFor = getErrorMap(errorMap, errors);

    return (
      <React.Fragment>
        <Grid item className={`${classes.main} mlMain py0`}>
          {hasErrorFor.none && !!showGeneralError && (
            <Notice error spacingTop={8} text={hasErrorFor.none} />
          )}
          <CreateLinodeDisabled isDisabled={userCannotCreateLinode} />
          <SelectImagePanel
            variant={variant}
            data-qa-select-image-panel
            title={imagePanelTitle}
            images={images}
            handleSelection={this.props.updateImageID}
            selectedImageID={this.props.selectedImageID}
            updateFor={[this.props.selectedImageID, errors]}
            initTab={0}
            error={hasErrorFor.image}
            disabled={userCannotCreateLinode}
          />
          <SelectRegionPanel
            error={hasErrorFor.region}
            regions={regions}
            data-qa-select-region-panel
            handleSelection={this.props.updateRegionID}
            selectedID={this.props.selectedRegionID}
            copy="Determine the best location for your Linode."
            updateFor={[this.props.selectedRegionID, errors]}
            disabled={userCannotCreateLinode}
          />
          <SelectPlanPanel
            error={hasErrorFor.type}
            types={types}
            data-qa-select-plan-panel
            onSelect={this.props.updateTypeID}
            selectedID={this.props.selectedTypeID}
            updateFor={[this.props.selectedTypeID, errors]}
            disabled={userCannotCreateLinode}
          />
          <LabelAndTagsPanel
            data-qa-label-and-tags-panel
            labelFieldProps={{
              label: 'Linode Label',
              value: this.props.label || '',
              onChange: this.props.updateLabel,
              errorText: hasErrorFor.label,
              disabled: userCannotCreateLinode
            }}
            tagsInputProps={{
              value: this.props.tags || [],
              onChange: this.props.updateTags,
              tagError: hasErrorFor.tags,
              disabled: userCannotCreateLinode
            }}
            updateFor={[this.props.tags, this.props.label, errors]}
          />
          <AccessPanel
            /* disable the password field if we haven't selected an image */
            data-qa-access-panel
            disabled={!this.props.selectedImageID}
            disabledReason={
              !this.props.selectedImageID
                ? 'You must select an image to set a root password'
                : ''
            }
            error={hasErrorFor.root_pass}
            sshKeyError={sshError}
            password={this.props.password}
            handleChange={this.props.updatePassword}
            updateFor={[
              this.props.password,
              errors,
              sshError,
              userSSHKeys,
              this.props.selectedImageID
            ]}
            users={
              userSSHKeys.length > 0 && this.props.selectedImageID
                ? userSSHKeys
                : []
            }
            requestKeys={requestKeys}
          />
          <AddonsPanel
            data-qa-addons-panel
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
        <Grid
          item
          className={
            'mlSidebar ' +
            (variant === 'private'
              ? classes.sidebarPrivate
              : classes.sidebarPublic)
          }
        >
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

              if (this.props.label) {
                displaySections.push({
                  title: 'Linode Label',
                  details: this.props.label
                });
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
                  data-qa-checkout-bar
                  heading="Linode Summary"
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

export default styled(FromImageContent);
