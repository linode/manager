import { InjectedNotistackProps, withSnackbar } from 'notistack';
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
import userSSHKeyHoc, {
  State as SSHKeys
} from 'src/features/linodes/userSSHKeyHoc';
import CASelectStackScriptPanel from 'src/features/StackScripts/SelectStackScriptPanel/CASelectStackScriptPanel';
// import SelectStackScriptPanel from 'src/features/StackScripts/SelectStackScriptPanel';
import StackScriptDrawer from 'src/features/StackScripts/StackScriptDrawer';
import UserDefinedFieldsPanel from 'src/features/StackScripts/UserDefinedFieldsPanel';
import {
  LinodeActionsProps,
  withLinodeActions
} from 'src/store/linodes/linode.containers';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import AddonsPanel from '../AddonsPanel';
import SelectImagePanel from '../SelectImagePanel';
import SelectPlanPanel from '../SelectPlanPanel';
import withLabelGenerator, { LabelProps } from '../withLabelGenerator';
import { renderBackupsDisplaySection } from './utils';

import {
  StackScriptFormStateHandlers,
  WithDisplayData,
  WithLinodesImagesTypesAndRegions
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
  history: any;
  selectedTabFromQuery?: string;
  selectedStackScriptFromQuery?: number;
  accountBackups: boolean;
  disabled?: boolean;
  request: (
    username: string,
    params?: any,
    filter?: any
  ) => Promise<Linode.ResourcePage<Linode.StackScript.Response>>;
  header: string;
}

interface State {
  userDefinedFields: Linode.StackScript.UserDefinedField[];
  udf_data: any;
  errors?: Linode.ApiFieldError[];
  selectedStackScriptLabel: string;
  selectedStackScriptUsername: string;
  isMakingRequest: boolean;
  compatibleImages: Linode.Image[];
}

const errorResources = {
  type: 'A plan selection',
  region: 'A region selection',
  label: 'A label',
  root_pass: 'A root password',
  image: 'image',
  tags: 'Tags'
};

type InnerProps = Props & WithLinodesImagesTypesAndRegions;

type CombinedProps = InnerProps &
  StackScriptFormStateHandlers &
  WithDisplayData &
  LinodeActionsProps &
  InjectedNotistackProps &
  LabelProps &
  SSHKeys &
  WithStyles<ClassNames>;

export class FromStackScriptContent extends React.Component<
  CombinedProps,
  State
> {
  state: State = {
    userDefinedFields: [],
    udf_data: null,
    selectedStackScriptLabel: '',
    selectedStackScriptUsername: this.props.selectedTabFromQuery || '',
    isMakingRequest: false,
    compatibleImages: []
  };

  mounted: boolean = false;

  handleSelectStackScript = (
    id: number,
    label: string,
    username: string,
    stackScriptImages: string[],
    userDefinedFields: Linode.StackScript.UserDefinedField[]
  ) => {
    const { imagesData, updateStackScriptID } = this.props;
    const filteredImages = imagesData.filter(image => {
      for (const stackScriptImage of stackScriptImages) {
        if (image.id === stackScriptImage) {
          return true;
        }
      }
      return false;
    });

    const defaultUDFData = {};
    userDefinedFields.forEach(eachField => {
      if (!!eachField.default) {
        defaultUDFData[eachField.name] = eachField.default;
      }
    });
    // first need to make a request to get the stackscript
    // then update userDefinedFields to the fields returned
    this.setState(
      {
        selectedStackScriptUsername: username,
        selectedStackScriptLabel: label,
        compatibleImages: filteredImages,
        userDefinedFields,
        udf_data: defaultUDFData
        // prob gonna need to update UDF here too
      },
      () => updateStackScriptID(id)
    );
  };

  resetStackScriptSelection = () => {
    // reset stackscript selection to unselected
    if (!this.mounted) {
      return;
    }
    this.setState({
      selectedStackScriptLabel: '',
      selectedStackScriptUsername: '',
      udf_data: null,
      userDefinedFields: [],
      compatibleImages: []
    });
  };

  handleChangeUDF = (key: string, value: string) => {
    // either overwrite or create new selection
    const newUDFData = assocPath([key], value, this.state.udf_data);

    this.setState({
      udf_data: { ...this.state.udf_data, ...newUDFData }
    });
  };

  createFromStackScript = () => {
    if (!this.props.selectedStackScriptID) {
      this.setState(
        {
          errors: [
            { field: 'stackscript_id', reason: 'You must select a StackScript' }
          ]
        },
        () => {
          scrollErrorIntoView();
        }
      );
      return;
    }
    this.createLinode();
  };

  createLinode = () => {
    const {
      backupsEnabled,
      password,
      userSSHKeys,
      handleSubmitForm,
      selectedImageID,
      selectedRegionID,
      selectedStackScriptID,
      selectedTypeID,
      tags
    } = this.props;
    const { udf_data } = this.state;

    this.setState({ isMakingRequest: true });

    const label = this.label();

    handleSubmitForm('create', {
      region: selectedRegionID,
      type: selectedTypeID,
      stackscript_id: selectedStackScriptID,
      stackscript_data: udf_data,
      label /* optional */,
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

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  filterPublicImages = (images: Linode.Image[]) => {
    return images.filter((image: Linode.Image) => image.is_public);
  };

  label = () => {
    const { selectedStackScriptLabel } = this.state;

    const {
      getLabel,
      imagesData,
      selectedImageID,
      selectedRegionID
    } = this.props;

    const selectedImage = imagesData.find(img => img.id === selectedImageID);

    const image = selectedImage && selectedImage.vendor;

    return getLabel(selectedStackScriptLabel, image, selectedRegionID);
  };

  render() {
    const {
      errors,
      userDefinedFields,
      udf_data,
      isMakingRequest,
      compatibleImages,
      selectedStackScriptLabel,
      selectedStackScriptUsername
    } = this.state;

    const {
      accountBackups,
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
      updateCustomLabel,
      disabled,
      request,
      header,
      toggleBackupsEnabled,
      togglePrivateIPEnabled,
      updateImageID,
      updatePassword,
      updateRegionID,
      updateTags,
      updateTypeID
    } = this.props;

    const hasErrorFor = getAPIErrorsFor(errorResources, errors);
    const generalError = hasErrorFor('none');

    const hasBackups = Boolean(backupsEnabled || accountBackups);

    const label = this.label();

    /*
     * errors with UDFs have dynamic keys
     * for exmaple, if there are UDFs that aren't filled out, you can can
     * errors that look something like this
     * { field: 'wordpress_pass', reason: 'you must fill out a WP password' }
     * Because of this, we need to both make each error doesn't match any
     * that are in our errorResources map and that it has a 'field' key in the first
     * place. Then, we can confirm we are indeed looking at a UDF error
     */
    const udfErrors = errors
      ? errors.filter(error => {
          // ensure the error isn't a root_pass, image, region, type, label
          const isNotUDFError = Object.keys(errorResources).some(errorKey => {
            return errorKey === error.field;
          });
          // if the 'field' prop exists and isn't any other error
          return !!error.field && !isNotUDFError;
        })
      : undefined;

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
            publicImages={this.filterPublicImages(imagesData) || []}
            resetSelectedStackScript={this.resetStackScriptSelection}
            disabled={disabled}
            request={request}
          />
          {!disabled && userDefinedFields && userDefinedFields.length > 0 && (
            <UserDefinedFieldsPanel
              errors={udfErrors}
              selectedLabel={selectedStackScriptLabel}
              selectedUsername={selectedStackScriptUsername}
              handleChange={this.handleChangeUDF}
              userDefinedFields={userDefinedFields}
              updateFor={[userDefinedFields, udf_data, errors]}
              udf_data={udf_data}
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
              onChange: updateCustomLabel,
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
            accountBackups={accountBackups}
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
                    accountBackups,
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
                  isMakingRequest={isMakingRequest}
                  disabled={isMakingRequest || disabled}
                  onDeploy={this.createFromStackScript}
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

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, InnerProps>(
  styled,
  withSnackbar,
  userSSHKeyHoc,
  withLabelGenerator,
  withLinodeActions
);

export default enhanced(FromStackScriptContent);
