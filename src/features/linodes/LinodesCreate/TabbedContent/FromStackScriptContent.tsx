import { assocPath, pathOr } from 'ramda';
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
import { Tag } from 'src/components/TagsInput';
import CASelectStackScriptPanel from 'src/features/StackScripts/SelectStackScriptPanel/CASelectStackScriptPanel';
import StackScriptDrawer from 'src/features/StackScripts/StackScriptDrawer';
import UserDefinedFieldsPanel from 'src/features/StackScripts/UserDefinedFieldsPanel';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import AddonsPanel from '../AddonsPanel';
import SelectImagePanel from '../SelectImagePanel';
import SelectPlanPanel from '../SelectPlanPanel';
import { renderBackupsDisplaySection } from './utils';

import {
  StackScriptFormStateHandlers,
  WithAll,
  WithDisplayData
} from '../types';

type ClassNames =
  | 'root'
  | 'main'
  | 'sidebar'
  | 'emptyImagePanel'
  | 'emptyImagePanelText';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  main: {},
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

interface Notice {
  text: string;
  level: 'warning' | 'error'; // most likely only going to need these two
}
interface Props {
  notice?: Notice;
  selectedTabFromQuery?: string;
  request: (
    username: string,
    params?: any,
    filter?: any
  ) => Promise<Linode.ResourcePage<Linode.StackScript.Response>>;
  header: string;
}

const errorResources = {
  type: 'A plan selection',
  region: 'A region selection',
  label: 'A label',
  root_pass: 'A root password',
  image: 'image',
  tags: 'Tags'
};

type InnerProps = Props & WithAll;

type CombinedProps = InnerProps &
  StackScriptFormStateHandlers &
  WithDisplayData &
  WithStyles<ClassNames>;

export class FromStackScriptContent extends React.PureComponent<CombinedProps> {
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
      tags
    } = this.props;

    handleSubmitForm('createFromStackScript', {
      region: selectedRegionID,
      type: selectedTypeID,
      stackscript_id: selectedStackScriptID,
      stackscript_data: selectedUDFs,
      label: this.props.label /* optional */,
      root_pass: password /* required if image ID is provided */,
      image: selectedImageID /* optional */,
      backups_enabled: backupsEnabled /* optional */,
      booted: true,
      authorized_users: userSSHKeys
        .filter(u => u.selected)
        .map(u => u.username),
      tags: tags ? tags.map((item: Tag) => item.value) : []
    });
  };

  render() {
    const {
      accountBackupsEnabled,
      errors,
      notice,
      backupsMonthlyPrice,
      regionsData,
      typesData,
      classes,
      imageDisplayInfo,
      regionDisplayInfo,
      selectedImageID,
      selectedRegionID,
      selectedStackScriptID,
      selectedTypeID,
      typeDisplayInfo,
      privateIPEnabled,
      tags,
      backupsEnabled,
      password,
      imagesData,
      userSSHKeys,
      userCannotCreateLinode: disabled,
      selectedStackScriptUsername,
      selectedStackScriptLabel,
      label,
      request,
      header,
      toggleBackupsEnabled,
      togglePrivateIPEnabled,
      updateImageID,
      updatePassword,
      updateRegionID,
      updateTags,
      updateTypeID,
      availableUserDefinedFields: userDefinedFields,
      availableStackScriptImages: compatibleImages,
      selectedUDFs: udf_data
    } = this.props;

    const hasErrorFor = getAPIErrorsFor(errorResources, errors);
    const generalError = hasErrorFor('none');

    const hasBackups = Boolean(backupsEnabled || accountBackupsEnabled);

    return (
      <React.Fragment>
        <Grid item className={`${classes.main} mlMain`}>
          <CreateLinodeDisabled isDisabled={disabled} />
          {!disabled && notice && (
            <Notice
              text={notice.text}
              error={notice.level === 'error'}
              warning={notice.level === 'warning'}
            />
          )}
          {generalError && <Notice text={generalError} error={true} />}
          <CASelectStackScriptPanel
            error={hasErrorFor('stackscript_id')}
            header={header}
            selectedId={selectedStackScriptID}
            selectedUsername={selectedStackScriptUsername}
            updateFor={[selectedStackScriptID, errors]}
            onSelect={this.handleSelectStackScript}
            publicImages={filterPublicImages(imagesData) || []}
            resetSelectedStackScript={() => null}
            disabled={disabled}
            request={request}
          />
          {!disabled && userDefinedFields && userDefinedFields.length > 0 && (
            <UserDefinedFieldsPanel
              errors={filterUDFErrors(this.props.errors)}
              selectedLabel={selectedStackScriptLabel || ''}
              selectedUsername={selectedStackScriptUsername || ''}
              handleChange={this.handleChangeUDF}
              userDefinedFields={userDefinedFields}
              updateFor={[userDefinedFields, udf_data, errors]}
              udf_data={udf_data || {}}
            />
          )}
          {!disabled && compatibleImages && compatibleImages.length > 0 ? (
            <SelectImagePanel
              images={compatibleImages}
              handleSelection={updateImageID}
              updateFor={[selectedImageID, compatibleImages, errors]}
              selectedImageID={selectedImageID}
              error={hasErrorFor('image')}
              hideMyImages={true}
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
            disabled={disabled}
          />
          <SelectPlanPanel
            error={hasErrorFor('type')}
            types={typesData}
            onSelect={updateTypeID}
            updateFor={[selectedTypeID, errors]}
            selectedID={selectedTypeID}
            disabled={disabled}
          />
          <LabelAndTagsPanel
            labelFieldProps={{
              label: 'Linode Label',
              value: label || '',
              onChange: this.props.updateLabel,
              errorText: hasErrorFor('label'),
              disabled
            }}
            tagsInputProps={{
              value: tags || [],
              onChange: updateTags,
              tagError: hasErrorFor('tags'),
              disabled
            }}
            updateFor={[tags, label, errors]}
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
            disabled={disabled}
          />
        </Grid>
        <Grid item className={`${classes.sidebar} mlSidebar`}>
          <Sticky topOffset={-24} disableCompensation>
            {(props: StickyProps) => {
              const displaySections = [];

              if (selectedStackScriptUsername && selectedStackScriptLabel) {
                displaySections.push({
                  title:
                    selectedStackScriptUsername +
                    ' / ' +
                    selectedStackScriptLabel
                });
              }

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

              if (hasBackups && typeDisplayInfo && backupsMonthlyPrice) {
                displaySections.push(
                  renderBackupsDisplaySection(
                    accountBackupsEnabled,
                    backupsMonthlyPrice
                  )
                );
              }

              let calculatedPrice = pathOr(0, ['monthly'], typeDisplayInfo);
              if (hasBackups && typeDisplayInfo && backupsMonthlyPrice) {
                calculatedPrice += backupsMonthlyPrice;
              }

              return (
                <CheckoutBar
                  heading={`${label || 'Linode'} Summary`}
                  calculatedPrice={calculatedPrice}
                  isMakingRequest={this.props.formIsSubmitting}
                  disabled={this.props.formIsSubmitting || disabled}
                  onDeploy={this.handleCreateLinode}
                  displaySections={displaySections}
                  {...props}
                />
              );
            }}
          </Sticky>
        </Grid>
        <StackScriptDrawer />
      </React.Fragment>
    );
  }
}

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

const enhanced = compose<CombinedProps, InnerProps>(styled);

export default enhanced(FromStackScriptContent);
