import { InjectedNotistackProps, withSnackbar } from 'notistack';
import { assocPath, pathOr } from 'ramda';
import * as React from 'react';
import { Sticky, StickyProps } from 'react-sticky';
import { compose } from 'recompose';
import AccessPanel, {
  Disabled,
  UserSSHKeyObject
} from 'src/components/AccessPanel';
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
import SelectRegionPanel, {
  ExtendedRegion
} from 'src/components/SelectRegionPanel';
import { Tag } from 'src/components/TagsInput';
import { resetEventsPolling } from 'src/events';
import userSSHKeyHoc from 'src/features/linodes/userSSHKeyHoc';
import SelectStackScriptPanel from 'src/features/StackScripts/SelectStackScriptPanel';
import StackScriptDrawer from 'src/features/StackScripts/StackScriptDrawer';
import UserDefinedFieldsPanel from 'src/features/StackScripts/UserDefinedFieldsPanel';
import {
  LinodeActionsProps,
  withLinodeActions
} from 'src/store/linodes/linode.containers';
import { allocatePrivateIP } from 'src/utilities/allocateIPAddress';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import AddonsPanel from '../AddonsPanel';
import SelectImagePanel from '../SelectImagePanel';
import SelectPlanPanel, { ExtendedType } from '../SelectPlanPanel';
import { Info } from '../util';
import withLabelGenerator, { LabelProps } from '../withLabelGenerator';
import { renderBackupsDisplaySection } from './utils';

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

export type TypeInfo =
  | {
      title: string;
      details: string;
      monthly: number;
      backupsMonthly: number | null;
    }
  | undefined;

interface Props {
  notice?: Notice;
  images: Linode.Image[];
  regions: ExtendedRegion[];
  types: ExtendedType[];
  getBackupsMonthlyPrice: (selectedTypeID: string | null) => number | null;
  getTypeInfo: (selectedTypeID: string | null) => TypeInfo;
  getRegionInfo: (selectedRegionID: string | null) => Info;
  history: any;
  selectedTabFromQuery?: string;
  selectedStackScriptFromQuery?: number;
  accountBackups: boolean;
  disabled?: boolean;

  /** Comes from HOC */
  userSSHKeys: UserSSHKeyObject[];
  handleDisablePasswordField: (imageSelected: boolean) => Disabled | undefined;
}

interface State {
  userDefinedFields: Linode.StackScript.UserDefinedField[];
  udf_data: any;
  errors?: Linode.ApiFieldError[];
  selectedStackScriptID: number | undefined;
  selectedStackScriptLabel: string;
  selectedStackScriptUsername: string;
  selectedImageID: string | null;
  selectedRegionID: string | null;
  selectedTypeID: string | null;
  backups: boolean;
  privateIP: boolean;
  label: string | null;
  password: string | null;
  isMakingRequest: boolean;
  compatibleImages: Linode.Image[];
  tags: Tag[];
}

const errorResources = {
  type: 'A plan selection',
  region: 'region',
  label: 'A label',
  root_pass: 'A root password',
  image: 'image',
  tags: 'Tags'
};

type CombinedProps = Props &
  LinodeActionsProps &
  InjectedNotistackProps &
  LabelProps &
  WithStyles<ClassNames>;

export class FromStackScriptContent extends React.Component<
  CombinedProps,
  State
> {
  state: State = {
    userDefinedFields: [],
    udf_data: null,
    selectedStackScriptID: this.props.selectedStackScriptFromQuery || undefined,
    selectedStackScriptLabel: '',
    selectedStackScriptUsername: this.props.selectedTabFromQuery || '',
    selectedImageID: null,
    selectedRegionID: null,
    selectedTypeID: null,
    backups: false,
    privateIP: false,
    label: '',
    password: '',
    isMakingRequest: false,
    compatibleImages: [],
    tags: []
  };

  mounted: boolean = false;

  handleSelectStackScript = (
    id: number,
    label: string,
    username: string,
    stackScriptImages: string[],
    userDefinedFields: Linode.StackScript.UserDefinedField[]
  ) => {
    const { images } = this.props;
    const filteredImages = images.filter(image => {
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
    this.setState({
      selectedStackScriptID: id,
      selectedStackScriptUsername: username,
      selectedStackScriptLabel: label,
      compatibleImages: filteredImages,
      userDefinedFields,
      udf_data: defaultUDFData
      // prob gonna need to update UDF here too
    });
  };

  resetStackScriptSelection = () => {
    // reset stackscript selection to unselected
    if (!this.mounted) {
      return;
    }
    this.setState({
      selectedStackScriptID: undefined,
      selectedStackScriptLabel: '',
      selectedStackScriptUsername: '',
      udf_data: null,
      userDefinedFields: [],
      compatibleImages: [],
      selectedImageID: null // stackscripts don't support all images, so we need to reset it
    });
  };

  handleChangeUDF = (key: string, value: string) => {
    // either overwrite or create new selection
    const newUDFData = assocPath([key], value, this.state.udf_data);

    this.setState({
      udf_data: { ...this.state.udf_data, ...newUDFData }
    });
  };

  handleSelectImage = (id: string) => {
    this.setState({ selectedImageID: id });
  };

  handleSelectRegion = (id: string) => {
    this.setState({ selectedRegionID: id });
  };

  handleSelectPlan = (id: string) => {
    this.setState({ selectedTypeID: id });
  };

  handleChangeTags = (selected: Tag[]) => {
    this.setState({ tags: selected });
  };

  handleTypePassword = (value: string) => {
    this.setState({ password: value });
  };

  handleToggleBackups = () => {
    this.setState({ backups: !this.state.backups });
  };

  handleTogglePrivateIP = () => {
    this.setState({ privateIP: !this.state.privateIP });
  };

  getImageInfo = (image: Linode.Image | undefined): Info => {
    return (
      image && {
        title: `${image.vendor || image.label}`,
        details: `${image.vendor ? image.label : ''}`
      }
    );
  };

  createFromStackScript = () => {
    if (!this.state.selectedStackScriptID) {
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
      history,
      userSSHKeys,
      linodeActions: { createLinode }
    } = this.props;
    const {
      selectedImageID,
      selectedRegionID,
      selectedTypeID,
      selectedStackScriptID,
      udf_data,
      password,
      backups,
      privateIP,
      tags
    } = this.state;

    this.setState({ isMakingRequest: true });

    const label = this.label();

    createLinode({
      region: selectedRegionID,
      type: selectedTypeID,
      stackscript_id: selectedStackScriptID,
      stackscript_data: udf_data,
      label: label ? label : null /* optional */,
      root_pass: password /* required if image ID is provided */,
      image: selectedImageID /* optional */,
      backups_enabled: backups /* optional */,
      booted: true,
      authorized_users: userSSHKeys
        .filter(u => u.selected)
        .map(u => u.username),
      tags: tags.map((item: Tag) => item.value)
    })
      .then(linode => {
        if (privateIP) {
          allocatePrivateIP(linode.id);
        }

        this.props.enqueueSnackbar(`Your Linode ${label} is being created.`, {
          variant: 'success'
        });

        resetEventsPolling();
        history.push('/linodes');
      })
      .catch(error => {
        if (!this.mounted) {
          return;
        }
        this.setState(
          () => ({
            errors: getAPIErrorOrDefault(error)
          }),
          () => {
            scrollErrorIntoView();
          }
        );
      })
      .finally(() => {
        if (!this.mounted) {
          return;
        }
        // regardless of whether request failed or not, change state and enable the submit btn
        this.setState({ isMakingRequest: false });
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
    const {
      selectedStackScriptLabel,
      selectedImageID,
      selectedRegionID
    } = this.state;
    const { getLabel, images } = this.props;

    const selectedImage = images.find(img => img.id === selectedImageID);

    const image = selectedImage && selectedImage.vendor;

    return getLabel(selectedStackScriptLabel, image, selectedRegionID);
  };

  render() {
    const {
      errors,
      userDefinedFields,
      udf_data,
      selectedImageID,
      selectedRegionID,
      selectedStackScriptID,
      selectedTypeID,
      backups,
      privateIP,
      tags,
      password,
      isMakingRequest,
      compatibleImages,
      selectedStackScriptLabel,
      selectedStackScriptUsername
    } = this.state;

    const {
      accountBackups,
      notice,
      getBackupsMonthlyPrice,
      regions,
      types,
      classes,
      getRegionInfo,
      getTypeInfo,
      images,
      userSSHKeys,
      updateCustomLabel,
      disabled
    } = this.props;

    const hasErrorFor = getAPIErrorsFor(errorResources, errors);
    const generalError = hasErrorFor('none');

    const hasBackups = Boolean(backups || accountBackups);

    const label = this.label();

    /*
     * errors with UDFs have dynamic keys
     * for example, if there are UDFs that aren't filled out, you can can
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

    const regionInfo = getRegionInfo(selectedRegionID);
    const typeInfo = getTypeInfo(selectedTypeID);
    const imageInfo = this.getImageInfo(
      images.find(image => image.id === selectedImageID)
    );

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
          <SelectStackScriptPanel
            error={hasErrorFor('stackscript_id')}
            selectedId={selectedStackScriptID}
            selectedUsername={selectedStackScriptUsername}
            updateFor={[selectedStackScriptID, errors, classes]}
            onSelect={this.handleSelectStackScript}
            publicImages={this.filterPublicImages(images) || []}
            resetSelectedStackScript={this.resetStackScriptSelection}
            disabled={disabled}
          />
          {!disabled && userDefinedFields && userDefinedFields.length > 0 && (
            <UserDefinedFieldsPanel
              errors={udfErrors}
              selectedLabel={selectedStackScriptLabel}
              selectedUsername={selectedStackScriptUsername}
              handleChange={this.handleChangeUDF}
              userDefinedFields={userDefinedFields}
              updateFor={[userDefinedFields, udf_data, errors, classes]}
              udf_data={udf_data}
            />
          )}
          {!disabled && compatibleImages && compatibleImages.length > 0 ? (
            <SelectImagePanel
              images={compatibleImages}
              handleSelection={this.handleSelectImage}
              updateFor={[selectedImageID, compatibleImages, errors, classes]}
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
            regions={regions}
            handleSelection={this.handleSelectRegion}
            selectedID={selectedRegionID}
            updateFor={[selectedRegionID, errors, classes]}
            copy="Determine the best location for your Linode."
            disabled={disabled}
          />
          <SelectPlanPanel
            error={hasErrorFor('type')}
            types={types}
            onSelect={this.handleSelectPlan}
            updateFor={[selectedTypeID, errors, classes]}
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
              value: tags,
              onChange: this.handleChangeTags,
              tagError: hasErrorFor('tags'),
              disabled
            }}
            updateFor={[tags, label, errors, classes]}
          />
          <AccessPanel
            /* disable the password field if we haven't selected an image */
            passwordFieldDisabled={
              this.props.handleDisablePasswordField(!!selectedImageID) || {
                disabled
              }
            }
            error={hasErrorFor('root_pass')}
            updateFor={[
              password,
              errors,
              userSSHKeys,
              selectedImageID,
              classes
            ]}
            password={password}
            handleChange={this.handleTypePassword}
            users={userSSHKeys.length > 0 && selectedImageID ? userSSHKeys : []}
          />
          <AddonsPanel
            backups={backups}
            accountBackups={accountBackups}
            backupsMonthly={getBackupsMonthlyPrice(selectedTypeID)}
            privateIP={privateIP}
            changeBackups={this.handleToggleBackups}
            changePrivateIP={this.handleTogglePrivateIP}
            updateFor={[privateIP, backups, selectedTypeID, classes]}
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

              if (imageInfo) {
                displaySections.push(imageInfo);
              }

              if (regionInfo) {
                displaySections.push({
                  title: regionInfo.title,
                  details: regionInfo.details
                });
              }

              if (typeInfo) {
                displaySections.push(typeInfo);
              }

              if (hasBackups && typeInfo && typeInfo.backupsMonthly) {
                displaySections.push(
                  renderBackupsDisplaySection(
                    accountBackups,
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

const enhanced = compose<CombinedProps, Props>(
  styled,
  withSnackbar,
  userSSHKeyHoc,
  withLabelGenerator,
  withLinodeActions
);

export default enhanced(FromStackScriptContent) as any;
