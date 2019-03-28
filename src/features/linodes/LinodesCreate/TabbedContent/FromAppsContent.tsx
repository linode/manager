import { assocPath, pathOr } from 'ramda';
import * as React from 'react';
import { Sticky, StickyProps } from 'react-sticky';

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
import { Tag } from 'src/components/TagsInput';
import UserDefinedFieldsPanel from 'src/features/StackScripts/UserDefinedFieldsPanel';
import AddonsPanel from '../AddonsPanel';
import SelectAppPanel from '../SelectAppPanel';
import SelectImagePanel from '../SelectImagePanel';
import SelectPlanPanel from '../SelectPlanPanel';

import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import { filterUDFErrors } from './formUtilities';
import { renderBackupsDisplaySection } from './utils';

import {
  AppsData,
  ReduxStatePropsAndSSHKeys,
  StackScriptFormStateHandlers,
  WithDisplayData,
  WithTypesRegionsAndImages
} from '../types';

type ClassNames = 'sidebar' | 'emptyImagePanel' | 'emptyImagePanelText';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  sidebar: {
    [theme.breakpoints.up('lg')]: {
      marginTop: '-130px !important'
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
  tags: 'Tags',
  stackscript_id: 'A StackScript'
};

type CombinedProps = WithDisplayData &
  AppsData &
  WithTypesRegionsAndImages &
  WithStyles<ClassNames> &
  ReduxStatePropsAndSSHKeys &
  StackScriptFormStateHandlers;

class FromAppsContent extends React.PureComponent<CombinedProps> {
  handleSelectStackScript = (
    id: number,
    label: string,
    username: string,
    stackScriptImages: string[],
    userDefinedFields: Linode.StackScript.UserDefinedField[]
  ) => {
    /**
     * based on the list of images we get back from the API, compare those
     * to our list of master images supported by Linode and filter out the ones
     * that aren't compatible with our selected StackScript
     */
    const compatibleImages = this.props.imagesData.filter(eachImage => {
      return stackScriptImages.some(
        eachSSImage => eachSSImage === eachImage.id
      );
    });

    /**
     * if a UDF field comes back from the API with a "default"
     * value, it means we need to pre-populate the field and form state
     */
    const defaultUDFData = userDefinedFields.reduce((accum, eachField) => {
      if (eachField.default) {
        accum[eachField.name] = eachField.default;
      }
      return accum;
    }, {});

    this.props.updateStackScript(
      id,
      label,
      username,
      userDefinedFields,
      compatibleImages,
      defaultUDFData
    );
  };

  handleChangeUDF = (key: string, value: string) => {
    // either overwrite or create new selection
    const newUDFData = assocPath([key], value, this.props.selectedUDFs);

    this.props.handleSelectUDFs({ ...this.props.selectedUDFs, ...newUDFData });
  };

  handleCreateLinode = () => {
    const {
      backupsEnabled,
      password,
      userSSHKeys,
      handleSubmitForm,
      selectedImageID,
      selectedRegionID,
      selectedStackScriptID,
      selectedTypeID,
      selectedUDFs,
      privateIPEnabled,
      tags
    } = this.props;

    handleSubmitForm('createFromApp', {
      region: selectedRegionID,
      type: selectedTypeID,
      stackscript_id: selectedStackScriptID,
      stackscript_data: selectedUDFs,
      label: this.props.label /* optional */,
      root_pass: password /* required if image ID is provided */,
      image: selectedImageID /* optional */,
      backups_enabled: backupsEnabled /* optional */,
      booted: true,
      private_ip: privateIPEnabled,
      authorized_users: userSSHKeys
        .filter(u => u.selected)
        .map(u => u.username),
      tags: tags ? tags.map((item: Tag) => item.value) : []
    });
  };

  render() {
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
      selectedStackScriptID,
      selectedStackScriptLabel,
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
      errors,
      appInstances,
      appInstancesError,
      appInstancesLoading
    } = this.props;

    const hasBackups = backupsEnabled || accountBackupsEnabled;
    const hasErrorFor = getAPIErrorsFor(errorResources, errors);
    const generalError = hasErrorFor('none');

    return (
      <React.Fragment>
        <Grid item className={`mlMain py0`}>
          <CreateLinodeDisabled isDisabled={userCannotCreateLinode} />
          {generalError && <Notice text={generalError} error={true} />}
          <SelectAppPanel
            appInstances={appInstances}
            appInstancesError={appInstancesError}
            appInstancesLoading={appInstancesLoading}
            selectedStackScriptID={selectedStackScriptID}
            disabled={userCannotCreateLinode}
            handleClick={this.handleSelectStackScript}
            error={hasErrorFor('stackscript_id')}
          />
          {!userCannotCreateLinode &&
            userDefinedFields &&
            userDefinedFields.length > 0 && (
              <UserDefinedFieldsPanel
                errors={filterUDFErrors(errorResources, errors)}
                selectedLabel={selectedStackScriptLabel || ''}
                selectedUsername="Linode"
                handleChange={this.handleChangeUDF}
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
            disabled={!selectedImageID}
            disabledReason={
              !selectedImageID
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
                  onDeploy={this.handleCreateLinode}
                  displaySections={displaySections}
                  {...stickyProps}
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

export default styled(FromAppsContent);
