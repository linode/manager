// import { assocPath, pathOr } from 'ramda';
import { pathOr } from 'ramda';
import * as React from 'react';
import { Sticky, StickyProps } from 'react-sticky';
import { compose } from 'recompose';

import AccessPanel from 'src/components/AccessPanel';
import CheckoutBar from 'src/components/CheckoutBar';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import CreateLinodeDisabled from 'src/components/CreateLinodeDisabled';
import Grid from 'src/components/Grid';
import LabelAndTagsPanel from 'src/components/LabelAndTagsPanel';
import Notice from 'src/components/Notice';
import SelectRegionPanel from 'src/components/SelectRegionPanel';
// import { Tag } from 'src/components/TagsInput';
import UserDefinedFieldsPanel from 'src/features/StackScripts/UserDefinedFieldsPanel';
import AddonsPanel from '../AddonsPanel';
import SelectImagePanel from '../SelectImagePanel';
import SelectPlanPanel from '../SelectPlanPanel';

import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import { renderBackupsDisplaySection } from './utils';

import {
  StackScriptFormStateHandlers,
  WithAll,
  WithDisplayData
} from '../types';

type ClassNames = 'sidebar' | 'emptyImagePanel' | 'emptyImagePanelText';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  sidebar: {
    [theme.breakpoints.up('lg')]: {
      marginTop: -130
    }
  },
  emptyImagePanel: {
    padding: theme.spacing.unit * 3
  },
  emptyImagePanelText: {
    marginTop: theme.spacing.unit,
    padding: `${theme.spacing.unit}px 0`
  }
});

const errorResources = {
  type: 'A plan selection',
  region: 'A region selection',
  label: 'A label',
  root_pass: 'A root password',
  image: 'Image',
  tags: 'Tags'
};

interface Props {}

type CombinedProps = Props &
  WithStyles<ClassNames> &
  WithDisplayData &
  StackScriptFormStateHandlers &
  WithAll;

const FromAppsContent: React.SFC<CombinedProps> = props => {
  const {
    accountBackupsEnabled,
    classes,
    typesData,
    regionsData,
    imageDisplayInfo,
    regionDisplayInfo,
    typeDisplayInfo,
    backupsMonthlyPrice,
    userSSHKeys,
    userCannotCreateLinode,
    selectedImageID,
    selectedRegionID,
    selectedStackScriptLabel,
    selectedStackScriptUsername,
    selectedTypeID,
    selectedUDFs: udf_data,
    label,
    tags,
    availableUserDefinedFields: userDefinedFields,
    availableStackScriptImages: compatibleImages,
    updateImageID,
    updateLabel,
    updatePassword,
    updateRegionID,
    updateTags,
    updateTypeID,
    formIsSubmitting,
    password,
    backupsEnabled,
    toggleBackupsEnabled,
    privateIPEnabled,
    togglePrivateIPEnabled,
    errors
  } = props;

  const hasBackups = props.backupsEnabled || accountBackupsEnabled;
  const hasErrorFor = getAPIErrorsFor(errorResources, errors);
  const generalError = hasErrorFor('none');

  return (
    <React.Fragment>
      <Grid item className={`mlMain`}>
        <CreateLinodeDisabled isDisabled={userCannotCreateLinode} />
        {generalError && <Notice text={generalError} error={true} />}
        <div>select app panel</div>
        {!userCannotCreateLinode &&
          userDefinedFields &&
          userDefinedFields.length > 0 && (
            <UserDefinedFieldsPanel
              errors={filterUDFErrors(errors)}
              selectedLabel={selectedStackScriptLabel || ''}
              selectedUsername={selectedStackScriptUsername || ''}
              handleChange={() => null}
              userDefinedFields={userDefinedFields}
              updateFor={[userDefinedFields, udf_data, errors]}
              udf_data={udf_data || {}}
            />
          )}
        {!userCannotCreateLinode &&
        compatibleImages &&
        compatibleImages.length > 0 ? (
          <SelectImagePanel
            images={compatibleImages}
            handleSelection={updateImageID}
            updateFor={[selectedImageID, compatibleImages, errors]}
            selectedImageID={selectedImageID}
            error={hasErrorFor('image')}
            variant="public"
          />
        ) : (
          <Paper className={classes.emptyImagePanel}>
            {/* empty state for images */}
            {hasErrorFor('image') && (
              <Notice error={true} text={hasErrorFor('image')} />
            )}
            <Typography role="header" variant="h2" data-qa-tp="Select Image">
              Select Image
            </Typography>
            <Typography
              variant="body1"
              className={classes.emptyImagePanelText}
              data-qa-no-compatible-images
            >
              No Compatible Images Available
            </Typography>
          </Paper>
        )}
        <SelectRegionPanel
          error={hasErrorFor('region')}
          regions={regionsData}
          handleSelection={updateRegionID}
          selectedID={selectedRegionID}
          updateFor={[selectedRegionID, errors]}
          copy="Determine the best location for your Linode."
          disabled={userCannotCreateLinode}
        />
        <SelectPlanPanel
          error={hasErrorFor('type')}
          types={typesData}
          onSelect={updateTypeID}
          updateFor={[selectedTypeID, errors]}
          selectedID={selectedTypeID}
          disabled={userCannotCreateLinode}
        />
        <LabelAndTagsPanel
          labelFieldProps={{
            label: 'Linode Label',
            value: label || '',
            onChange: updateLabel,
            errorText: hasErrorFor('label'),
            disabled: userCannotCreateLinode
          }}
          tagsInputProps={{
            value: tags || [],
            onChange: updateTags,
            tagError: hasErrorFor('tags'),
            disabled: userCannotCreateLinode
          }}
          updateFor={[tags, label, errors]}
        />
        <AccessPanel
          /* disable the password field if we haven't selected an image */
          disabled={!props.selectedImageID}
          disabledReason={
            !props.selectedImageID
              ? 'You must select an image to set a root password'
              : ''
          }
          error={hasErrorFor('root_pass')}
          updateFor={[password, errors, userSSHKeys, selectedImageID]}
          password={password}
          handleChange={updatePassword}
          users={userSSHKeys.length > 0 && selectedImageID ? userSSHKeys : []}
        />
        <AddonsPanel
          backups={backupsEnabled}
          accountBackups={accountBackupsEnabled}
          backupsMonthly={backupsMonthlyPrice}
          privateIP={privateIPEnabled}
          changeBackups={toggleBackupsEnabled}
          changePrivateIP={togglePrivateIPEnabled}
          updateFor={[privateIPEnabled, backupsEnabled, selectedTypeID]}
          disabled={userCannotCreateLinode}
        />
      </Grid>
      <Grid item className={`${classes.sidebar} mlSidebar`}>
        <Sticky topOffset={-24} disableCompensation>
          {(stickyProps: StickyProps) => {
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
                heading={`${label || 'Linode'} Summary`}
                calculatedPrice={calculatedPrice}
                isMakingRequest={formIsSubmitting}
                disabled={formIsSubmitting || userCannotCreateLinode}
                onDeploy={() => null}
                displaySections={displaySections}
                {...stickyProps}
              />
            );
          }}
        </Sticky>
      </Grid>
    </React.Fragment>
  );
};

/**
 * @returns { Linode.Image[] } - a list of public images AKA
 * images that are officially supported by Linode
 *
 * @todo test this
 */
export const filterPublicImages = (images: Linode.Image[]) => {
  return images.filter((image: Linode.Image) => image.is_public);
};

/**
 * filter out all the UDF errors from our error state.
 * To do this, we compare the keys from the error state to our "errorResources"
 * map and return all the errors that don't match the keys in that object
 *
 * @todo test this function
 */
export const filterUDFErrors = (errors?: Linode.ApiFieldError[]) => {
  return !errors
    ? []
    : errors.filter(eachError => {
        return !Object.keys(errorResources).some(
          eachKey => eachKey === eachError.field
        );
      });
};

const styled = withStyles(styles);

export default compose<CombinedProps, Props & WithDisplayData & WithAll>(
  styled,
  React.memo
)(FromAppsContent);
