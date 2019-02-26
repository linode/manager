import { InjectedNotistackProps, withSnackbar } from 'notistack';
import { find, pathOr } from 'ramda';
import * as React from 'react';
import { Sticky, StickyProps } from 'react-sticky';
import { compose } from 'recompose';
import AccessPanel, { Disabled } from 'src/components/AccessPanel';
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
import SelectRegionPanel, {
  ExtendedRegion
} from 'src/components/SelectRegionPanel';
import { Tag } from 'src/components/TagsInput';
import { resetEventsPolling } from 'src/events';
import userSSHKeyHoc, {
  State as UserSSHKeyProps
} from 'src/features/linodes/userSSHKeyHoc';
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
const DEFAULT_IMAGE = 'linode/debian9';

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

interface Props {
  errors?: Linode.ApiFieldError[];
  notice?: Notice;
  images: Linode.Image[];
  regions: ExtendedRegion[];
  types: ExtendedType[];
  getBackupsMonthlyPrice: (selectedTypeID: string | null) => number | null;
  getTypeInfo: (selectedTypeID: string | null) => TypeInfo;
  getRegionInfo: (selectedRegionID: string | null) => Info;
  history: any;
  accountBackups: boolean;
  handleDisablePasswordField: (imageSelected: boolean) => Disabled | undefined;
  disabled?: boolean;
}

interface State {
  selectedImageID: string | null;
  selectedRegionID: string | null;
  selectedTypeID: string | null;
  label: string;
  errors?: Linode.ApiFieldError[];
  backups: boolean;
  privateIP: boolean;
  password: string | null;
  isMakingRequest: boolean;
  initTab?: number;
  tags: Tag[];
}

export type TypeInfo =
  | {
      title: string;
      details: string;
      monthly: number;
      backupsMonthly: number | null;
    }
  | undefined;

const errorResources = {
  type: 'A plan selection',
  region: 'region',
  label: 'A label',
  root_pass: 'A root password',
  image: 'Image',
  tags: 'Tags'
};

type CombinedProps = Props &
  LinodeActionsProps &
  UserSSHKeyProps &
  InjectedNotistackProps &
  LabelProps &
  WithStyles<ClassNames>;

export class FromImageContent extends React.Component<CombinedProps, State> {
  state: State = {
    selectedImageID: pathOr(
      DEFAULT_IMAGE,
      ['history', 'location', 'state', 'selectedImageId'],
      this.props
    ),
    selectedTypeID: null,
    selectedRegionID: null,
    password: '',
    label: '',
    backups: false,
    privateIP: false,
    isMakingRequest: false,
    initTab: pathOr(
      null,
      ['history', 'location', 'state', 'initTab'],
      this.props
    ),
    tags: []
  };

  mounted: boolean = false;

  handleSelectImage = (id: string) => {
    // Allow for deselecting an image
    id === this.state.selectedImageID
      ? this.setState({ selectedImageID: null })
      : this.setState({ selectedImageID: id });
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

  label = () => {
    const { selectedImageID, selectedRegionID } = this.state;
    const { getLabel, images } = this.props;

    const selectedImage = images.find(img => img.id === selectedImageID);

    // Use 'vendor' if it's a public image, otherwise use label (because 'vendor' will be null)
    const image =
      selectedImage &&
      (selectedImage.is_public ? selectedImage.vendor : selectedImage.label);

    return getLabel(image, selectedRegionID);
  };

  createNewLinode = () => {
    const {
      history,
      userSSHKeys,
      linodeActions: { createLinode }
    } = this.props;
    const {
      selectedImageID,
      selectedRegionID,
      selectedTypeID,
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
      /* label is optional, pass null instead of empty string to bypass Yup validation. */
      label: label ? label : null,
      root_pass: password /* required if image ID is provided */,
      image: selectedImageID /* optional */,
      backups_enabled: backups /* optional */,
      booted: true,
      authorized_users: userSSHKeys
        .filter(u => u.selected)
        .map(u => u.username),
      tags: tags.map((item: Tag) => item.value)
    })
      .then((linode: Linode.Linode) => {
        if (privateIP) {
          allocatePrivateIP(linode.id);
        }

        this.props.enqueueSnackbar(`Your Linode ${label} is being created.`, {
          variant: 'success'
        });

        resetEventsPolling();
        history.push('/linodes');
      })
      .catch((error: any) => {
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

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidMount() {
    this.mounted = true;

    if (
      !find(image => image.id === this.state.selectedImageID, this.props.images)
    ) {
      this.setState({ selectedImageID: null });
    }
  }

  render() {
    const {
      errors,
      backups,
      privateIP,
      selectedImageID,
      tags,
      selectedRegionID,
      selectedTypeID,
      password,
      isMakingRequest,
      initTab
    } = this.state;

    const {
      accountBackups,
      classes,
      notice,
      types,
      regions,
      images,
      getBackupsMonthlyPrice,
      getRegionInfo,
      getTypeInfo,
      updateCustomLabel,
      userSSHKeys,
      disabled
    } = this.props;

    const hasErrorFor = getAPIErrorsFor(errorResources, errors);
    const generalError = hasErrorFor('none');

    const imageInfo = this.getImageInfo(
      this.props.images.find(image => image.id === selectedImageID)
    );

    const regionInfo = getRegionInfo(selectedRegionID);

    const typeInfo = getTypeInfo(selectedTypeID);

    const hasBackups = backups || accountBackups;

    const label = this.label();

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
          <CreateLinodeDisabled isDisabled={disabled} />
          {generalError && <Notice text={generalError} error={true} />}
          <SelectImagePanel
            images={images}
            handleSelection={this.handleSelectImage}
            selectedImageID={selectedImageID}
            updateFor={[selectedImageID, errors]}
            initTab={initTab}
            error={hasErrorFor('image')}
            disabled={disabled}
          />
          <SelectRegionPanel
            error={hasErrorFor('region')}
            regions={regions}
            handleSelection={this.handleSelectRegion}
            selectedID={selectedRegionID}
            copy="Determine the best location for your Linode."
            updateFor={[selectedRegionID, errors]}
            disabled={disabled}
          />
          <SelectPlanPanel
            error={hasErrorFor('type')}
            types={types}
            onSelect={this.handleSelectPlan}
            selectedID={selectedTypeID}
            updateFor={[selectedTypeID, errors]}
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
            updateFor={[tags, label, errors]}
          />
          <AccessPanel
            /* disable the password field if we haven't selected an image */
            passwordFieldDisabled={
              this.props.handleDisablePasswordField(!!selectedImageID) || {
                disabled
              }
            }
            error={hasErrorFor('root_pass')}
            password={password}
            handleChange={this.handleTypePassword}
            updateFor={[password, errors, userSSHKeys, selectedImageID]}
            users={userSSHKeys.length > 0 && selectedImageID ? userSSHKeys : []}
          />
          <AddonsPanel
            backups={backups}
            accountBackups={accountBackups}
            backupsMonthly={getBackupsMonthlyPrice(selectedTypeID)}
            privateIP={privateIP}
            changeBackups={this.handleToggleBackups}
            changePrivateIP={this.handleTogglePrivateIP}
            updateFor={[privateIP, backups, selectedTypeID]}
            disabled={disabled}
          />
        </Grid>
        <Grid item className={`${classes.sidebar} mlSidebar`}>
          <Sticky topOffset={-24} disableCompensation>
            {(props: StickyProps) => {
              const displaySections = [];
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
                  onDeploy={this.createNewLinode}
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

const enhanced = compose<CombinedProps, Props>(
  styled,
  withSnackbar,
  userSSHKeyHoc,
  withLabelGenerator,
  withLinodeActions
);

export default enhanced(FromImageContent);
