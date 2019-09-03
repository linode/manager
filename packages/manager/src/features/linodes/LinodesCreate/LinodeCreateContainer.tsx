import { Image } from 'linode-js-sdk/lib/images';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { StickyContainer } from 'react-sticky';
import { compose as recompose } from 'recompose';

import regionsContainer from 'src/containers/regions.container';
import withTypes from 'src/containers/types.container';
import withImages from 'src/containers/withImages.container';
import withLinodes from 'src/containers/withLinodes.container';
import { CreateTypes } from 'src/store/linodeCreate/linodeCreate.actions';
import {
  LinodeActionsProps,
  withLinodeActions
} from 'src/store/linodes/linode.containers';

import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import { Tag } from 'src/components/TagsInput';

import { dcDisplayNames } from 'src/constants';
import withLabelGenerator, {
  LabelProps
} from 'src/features/linodes/LinodesCreate/withLabelGenerator';
import { typeLabelDetails } from 'src/features/linodes/presentation';
import userSSHKeyHoc from 'src/features/linodes/userSSHKeyHoc';
import {
  hasGrant,
  isRestrictedUser
} from 'src/features/Profile/permissionsHelpers';
import { getParamsFromUrl } from 'src/utilities/queryParams';
import LinodeCreate from './LinodeCreate';
import { ExtendedType } from './SelectPlanPanel';

import {
  HandleSubmit,
  Info,
  ReduxStateProps,
  ReduxStatePropsAndSSHKeys,
  TypeInfo,
  WithImagesProps,
  WithLinodesProps,
  WithRegionsProps,
  WithTypesProps
} from './types';

import { resetEventsPolling } from 'src/events';
import { getOneClickApps } from 'src/features/StackScripts/stackScriptUtils';
import { cloneLinode, CreateLinodeRequest } from 'src/services/linodes';

import { upsertLinode } from 'src/store/linodes/linodes.actions';
import { MapState } from 'src/store/types';

import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { sendCreateLinodeEvent } from 'src/utilities/ga';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { getRegionIDFromLinodeID } from './utilities';

type StackScript = Linode.StackScript.Response;

interface State {
  selectedImageID?: string;
  selectedRegionID?: string;
  selectedTypeID?: string;
  selectedLinodeID?: number;
  selectedBackupID?: number;
  availableUserDefinedFields?: Linode.StackScript.UserDefinedField[];
  availableStackScriptImages?: Image[];
  selectedStackScriptID?: number;
  selectedStackScriptLabel?: string;
  selectedStackScriptUsername?: string;
  selectedDiskSize?: number;
  label: string;
  backupsEnabled: boolean;
  privateIPEnabled: boolean;
  password: string;
  udfs?: any[];
  tags?: Tag[];
  errors?: Linode.ApiFieldError[];
  formIsSubmitting: boolean;
  appInstances?: StackScript[];
  appInstancesLoading: boolean;
  appInstancesError?: string;
}

type CombinedProps = WithSnackbarProps &
  CreateType &
  LinodeActionsProps &
  WithImagesProps &
  WithTypesProps &
  WithLinodesProps &
  WithRegionsProps &
  ReduxStatePropsAndSSHKeys &
  DispatchProps &
  LabelProps &
  RouteComponentProps<{}>;

const defaultState: State = {
  privateIPEnabled: false,
  backupsEnabled: false,
  label: '',
  password: '',
  selectedImageID: 'linode/debian9',
  selectedBackupID: undefined,
  selectedDiskSize: undefined,
  selectedLinodeID: undefined,
  selectedStackScriptID: undefined,
  selectedStackScriptLabel: '',
  selectedStackScriptUsername: '',
  selectedRegionID: undefined,
  selectedTypeID: undefined,
  tags: [],
  formIsSubmitting: false,
  errors: undefined,
  appInstancesLoading: false
};

const trimOneClickFromLabel = (script: StackScript) => {
  return {
    ...script,
    label: script.label.replace('One-Click', '')
  };
};

class LinodeCreateContainer extends React.PureComponent<CombinedProps, State> {
  params = getParamsFromUrl(this.props.location.search);

  state: State = {
    ...defaultState,
    // These can be passed in as query params
    selectedTypeID: this.params.typeID,
    selectedRegionID: this.params.regionID
  };

  componentDidUpdate(prevProps: CombinedProps) {
    /**
     * if we're clicking on the stackscript create flow, we need to stop
     * defaulting to Debian 9 because it's possible the user chooses a stackscript
     * that isn't compatible with the defaulted image
     */
    if (
      prevProps.createType !== 'fromStackScript' &&
      this.props.createType === 'fromStackScript'
    ) {
      this.setState({ selectedImageID: undefined });
    }
  }

  componentDidMount() {
    const params = getParamsFromUrl(this.props.location.search);
    if (params && params !== {}) {
      this.setState({
        // This set is for creating from a Backup
        selectedBackupID: isNaN(+params.backupID)
          ? undefined
          : +params.backupID,
        selectedLinodeID: isNaN(+params.linodeID) ? undefined : +params.linodeID
      });
    }
    this.setState({ appInstancesLoading: true });
    getOneClickApps()
      // Don't display One-Click Helpers to the user
      .then(response =>
        response.data.filter(script => !script.label.match(/helpers/i))
      )
      .then(response =>
        response.map(stackscript => trimOneClickFromLabel(stackscript))
      )
      .then(response => {
        this.setState({
          appInstancesLoading: false,
          appInstances: response
        });
      })
      .catch(_ => {
        this.setState({
          appInstancesLoading: false,
          appInstancesError: 'There was an error loading One-Click Apps.'
        });
      });
  }

  clearCreationState = () => {
    this.props.resetSSHKeys();
    this.setState(defaultState);
  };

  setImageID = (id: string) => {
    /** allows for de-selecting an image */
    if (id === this.state.selectedImageID) {
      return this.setState({ selectedImageID: undefined });
    }
    return this.setState({ selectedImageID: id });
  };

  setBackupID = (id: number) => {
    this.setState({ selectedBackupID: id });
  };

  setRegionID = (id: string) => this.setState({ selectedRegionID: id });

  setTypeID = (id: string) => this.setState({ selectedTypeID: id });

  setLinodeID = (id: number, diskSize?: number) => {
    if (id !== this.state.selectedLinodeID) {
      /**
       * reset selected plan and set the selectedDiskSize
       * for the purpose of disabling plans that are smaller
       * than the clone source.
       *
       * Also, when creating from backup, we set the region
       * to the same region as the Linode that owns the backup,
       * since the API does not infer this automatically.
       */

      /**
       * safe to ignore possibility of "undefined"
       * null checking happens in CALinodeCreate
       */
      const selectedRegionID = getRegionIDFromLinodeID(
        this.props.linodesData!,
        id
      );
      this.setState({
        selectedLinodeID: id,
        selectedDiskSize: diskSize,
        selectedTypeID: undefined,
        selectedBackupID: undefined,
        selectedRegionID
      });
    }
  };

  setStackScript = (
    id: number,
    label: string,
    username: string,
    userDefinedFields: Linode.StackScript.UserDefinedField[],
    images: Image[],
    defaultData?: any
  ) => {
    /**
     * If we're switching from one cloud app to another,
     * usually the only compatible image will be Debian 9. If this
     * is the case, preselect that value.
     */
    const defaultImage = images.length === 1 ? images[0].id : undefined;

    this.setState({
      selectedStackScriptID: id,
      selectedStackScriptLabel: label,
      selectedStackScriptUsername: username,
      availableUserDefinedFields: userDefinedFields,
      availableStackScriptImages: images,
      udfs: defaultData,
      /** reset image because stackscript might not be compatible with selected one */
      selectedImageID: defaultImage,
      errors: undefined
    });
  };

  setDiskSize = (size: number) => this.setState({ selectedDiskSize: size });

  setPassword = (password: string) => this.setState({ password });

  toggleBackupsEnabled = () =>
    this.setState({ backupsEnabled: !this.state.backupsEnabled });

  togglePrivateIPEnabled = () =>
    this.setState({ privateIPEnabled: !this.state.privateIPEnabled });

  setTags = (tags: Tag[]) => this.setState({ tags });

  setUDFs = (udfs: any[]) => this.setState({ udfs });

  generateLabel = () => {
    const { getLabel, imagesData, regionsData } = this.props;
    const {
      selectedImageID,
      selectedRegionID,
      selectedStackScriptLabel
    } = this.state;

    /* tslint:disable-next-line  */
    let arg1,
      arg2,
      arg3 = '';

    /**
     * lean in favor of using stackscript label
     * then next priority is image label
     */
    if (selectedStackScriptLabel) {
      arg1 = selectedStackScriptLabel;
    } else if (selectedImageID) {
      /**
       * safe to ignore possibility of "undefined"
       * null checking happens in CALinodeCreate
       */
      const selectedImage = imagesData!.find(img => img.id === selectedImageID);
      /**
       * Use 'vendor' if it's a public image, otherwise use label (because 'vendor' will be null)
       *
       * If we have no selectedImage, just use an empty string
       */
      arg1 = selectedImage
        ? selectedImage.is_public
          ? selectedImage.vendor
          : selectedImage.label
        : '';
    }

    if (selectedRegionID) {
      /**
       * safe to ignore possibility of "undefined"
       * null checking happens in CALinodeCreate
       */
      const selectedRegion = regionsData!.find(
        region => region.id === selectedRegionID
      );

      arg2 = selectedRegion ? selectedRegion.id : '';
    }

    if (this.props.createType === 'fromLinode') {
      // @todo handle any other custom label cases we'd like to have here
      arg3 = 'clone';
    }

    return getLabel(arg1, arg2, arg3);
  };

  submitForm: HandleSubmit = (payload, linodeID?: number) => {
    const { createType } = this.props;

    /**
     * run a certain linode action based on the type
     * if clone, run clone service request and upsert linode
     * if create, run create action
     */
    if (createType === 'fromLinode' && !linodeID) {
      return this.setState(
        () => ({
          errors: [
            {
              reason: 'You must select a Linode to clone from',
              field: 'linode_id'
            }
          ]
        }),
        () => scrollErrorIntoView()
      );
    }

    if (createType === 'fromBackup' && !this.state.selectedBackupID) {
      /* a backup selection is also required */
      this.setState(
        {
          errors: [{ field: 'backup_id', reason: 'You must select a Backup.' }]
        },
        () => {
          scrollErrorIntoView();
        }
      );
      return;
    }

    if (createType === 'fromStackScript' && !this.state.selectedStackScriptID) {
      return this.setState(
        () => ({
          errors: [
            {
              reason: 'You must select a StackScript.',
              field: 'stackscript_id'
            }
          ]
        }),
        () => scrollErrorIntoView()
      );
    }

    if (createType === 'fromApp' && !this.state.selectedStackScriptID) {
      return this.setState(
        () => ({
          errors: [
            {
              reason: 'You must select a One-Click App.',
              field: 'stackscript_id'
            }
          ]
        }),
        () => scrollErrorIntoView()
      );
    }

    const request =
      createType === 'fromLinode'
        ? () => cloneLinode(linodeID!, payload)
        : () => this.props.linodeActions.createLinode(payload);

    this.setState({ formIsSubmitting: true });

    return request()
      .then((response: Linode.Linode) => {
        this.setState({ formIsSubmitting: false });

        /** if cloning a Linode, upsert Linode in redux */
        if (createType === 'fromLinode') {
          this.props.upsertLinode(response);
        }

        /** GA creation event */
        handleAnalytics(
          createType,
          payload,
          this.state.selectedStackScriptLabel
        );

        /** show toast */
        this.props.enqueueSnackbar(
          `Your Linode ${response.label} is being created.`,
          {
            variant: 'success'
          }
        );

        /** reset the Events polling */
        resetEventsPolling();

        /** send the user to the Linode detail page */
        this.props.history.push(`/linodes/${response.id}`);
      })
      .catch(error => {
        this.setState(
          () => ({
            errors: getAPIErrorOrDefault(error),
            formIsSubmitting: false
          }),
          () => scrollErrorIntoView()
        );
      });
  };

  getBackupsMonthlyPrice = (): number | undefined | null => {
    const type = this.getTypeInfo();

    return !type ? undefined : type.backupsMonthly;
  };

  getTypeInfo = (): TypeInfo => {
    const { selectedTypeID } = this.state;
    /**
     * safe to ignore possibility of "undefined"
     * null checking happens in CALinodeCreate
     */
    const typeInfo = this.reshapeTypeInfo(
      this.props.typesData!.find(type => type.id === selectedTypeID)
    );

    return typeInfo;
  };

  reshapeTypeInfo = (type?: ExtendedType): TypeInfo | undefined => {
    return (
      type && {
        title: type.label,
        details: `${typeLabelDetails(type.memory, type.disk, type.vcpus)}`,
        monthly: type.price.monthly,
        backupsMonthly: type.addons.backups.price.monthly
      }
    );
  };

  getRegionInfo = (): Info | undefined => {
    const { selectedRegionID } = this.state;

    if (!selectedRegionID) {
      return;
    }
    /**
     * safe to ignore possibility of "undefined"
     * null checking happens in CALinodeCreate
     */
    const selectedRegion = this.props.regionsData!.find(
      region => region.id === selectedRegionID
    );

    return (
      selectedRegion && {
        title: selectedRegion.country.toUpperCase(),
        details: selectedRegion.display
      }
    );
  };

  getImageInfo = (): Info | undefined => {
    const { selectedImageID } = this.state;

    if (!selectedImageID) {
      return;
    }

    /**
     * safe to ignore possibility of "undefined"
     * null checking happens in CALinodeCreate
     */
    const selectedImage = this.props.imagesData!.find(
      image => image.id === selectedImageID
    );

    return (
      selectedImage && {
        title: `${selectedImage.vendor || selectedImage.label}`,
        details: `${selectedImage.vendor ? selectedImage.label : ''}`
      }
    );
  };

  render() {
    const { enqueueSnackbar, closeSnackbar, ...restOfProps } = this.props;
    const { label, udfs: selectedUDFs, ...restOfState } = this.state;
    return (
      <StickyContainer>
        <DocumentTitleSegment segment="Create a Linode" />
        <Grid container spacing={0}>
          <Grid item xs={12}>
            <Typography variant="h1" data-qa-create-linode-header>
              Create New Linode
            </Typography>
          </Grid>
          <LinodeCreate
            regionDisplayInfo={this.getRegionInfo()}
            imageDisplayInfo={this.getImageInfo()}
            typeDisplayInfo={this.getTypeInfo()}
            backupsMonthlyPrice={this.getBackupsMonthlyPrice()}
            updateRegionID={this.setRegionID}
            updateImageID={this.setImageID}
            updateTypeID={this.setTypeID}
            updateLinodeID={this.setLinodeID}
            updateDiskSize={this.setDiskSize}
            selectedUDFs={selectedUDFs}
            handleSelectUDFs={this.setUDFs}
            updateStackScript={this.setStackScript}
            label={this.generateLabel()}
            updateLabel={this.props.updateCustomLabel}
            updatePassword={this.setPassword}
            toggleBackupsEnabled={this.toggleBackupsEnabled}
            togglePrivateIPEnabled={this.togglePrivateIPEnabled}
            updateTags={this.setTags}
            handleSubmitForm={this.submitForm}
            resetCreationState={this.clearCreationState}
            setBackupID={this.setBackupID}
            {...restOfProps}
            {...restOfState}
          />
        </Grid>
      </StickyContainer>
    );
  }
}

interface CreateType {
  createType: CreateTypes;
}

const mapStateToProps: MapState<
  ReduxStateProps & CreateType,
  CombinedProps
> = state => ({
  accountBackupsEnabled: pathOr(
    false,
    ['__resources', 'accountSettings', 'data', 'backups_enabled'],
    state
  ),
  /**
   * user cannot create Linodes if they are a restricted user
   * and do not have the "add_linodes" grant
   */
  userCannotCreateLinode:
    isRestrictedUser(state) && !hasGrant(state, 'add_linodes'),
  createType: state.createLinode.type
});

interface DispatchProps {
  upsertLinode: (l: Linode.Linode) => void;
}

const connected = connect(
  mapStateToProps,
  { upsertLinode }
);

const withRegions = regionsContainer(({ data, loading, error }) => ({
  regionsData: data.map(r => ({ ...r, display: dcDisplayNames[r.id] })),
  regionsLoading: loading,
  regionsError: error
}));

export default recompose<CombinedProps, {}>(
  withImages((ownProps, imagesData, imagesLoading, imagesError) => ({
    ...ownProps,
    imagesData,
    imagesLoading,
    imagesError
  })),
  withLinodes((ownProps, linodesData, linodesLoading, linodesError) => ({
    ...ownProps,
    linodesData,
    linodesLoading,
    linodesError
  })),
  withRegions,
  withTypes,
  withLinodeActions,
  connected,
  withRouter,
  withSnackbar,
  userSSHKeyHoc,
  withLabelGenerator
)(LinodeCreateContainer);

const actionsAndLabels = {
  fromApp: { action: 'one-click', labelPayloadKey: 'stackscript_id' },
  fromBackup: { action: 'backup', labelPayloadKey: 'backup_id' },
  fromImage: { action: 'image', labelPayloadKey: 'image' },
  fromLinode: { action: 'clone', labelPayloadKey: 'type' },
  fromStackScript: { action: 'stackscript', labelPayloadKey: 'stackscript_id' }
};

const handleAnalytics = (
  type: CreateTypes,
  payload: CreateLinodeRequest,
  label?: string
) => {
  const eventInfo = actionsAndLabels[type];
  let eventAction = 'unknown';
  let eventLabel = '';

  if (eventInfo) {
    eventAction = eventInfo.action;
    const payloadLabel = payload[eventInfo.labelPayloadKey];
    // Checking if payload label comes back as a number, if so return it as a string, otherwise event won't fire.
    if (isNaN(payloadLabel)) {
      eventLabel = payloadLabel;
    } else {
      eventLabel = payloadLabel.toString();
    }
  }
  if (label) {
    eventLabel = label;
  }

  sendCreateLinodeEvent(eventAction, eventLabel);
};
