import { Image } from '@linode/api-v4/lib/images';
import {
  cloneLinode,
  CreateLinodeRequest,
  Interface,
  Linode,
  LinodeTypeClass,
} from '@linode/api-v4/lib/linodes';
import { Region } from '@linode/api-v4/lib/regions';
import { StackScript, UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import { APIError } from '@linode/api-v4/lib/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { compose as recompose } from 'recompose';
import Breadcrumb from 'src/components/Breadcrumb';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import { Tag } from 'src/components/TagsInput';
import { REFRESH_INTERVAL } from 'src/constants';
import withRegions from 'src/containers/regions.container';
import withTypes from 'src/containers/types.container';
import withFlags, {
  FeatureFlagConsumerProps,
} from 'src/containers/withFeatureFlagConsumer.container';
import withImages, {
  ImagesDispatch,
  WithImages,
} from 'src/containers/withImages.container';
import withLinodes from 'src/containers/withLinodes.container';
import { resetEventsPolling } from 'src/eventsPolling';
import withLabelGenerator, {
  LabelProps,
} from 'src/features/linodes/LinodesCreate/withLabelGenerator';
import deepCheckRouter from 'src/features/linodes/LinodesDetail/reloadableWithRouter';
import { typeLabelDetails } from 'src/features/linodes/presentation';
import userSSHKeyHoc from 'src/features/linodes/userSSHKeyHoc';
import {
  hasGrant,
  isRestrictedUser,
} from 'src/features/Profile/permissionsHelpers';
import {
  baseApps,
  getOneClickApps,
} from 'src/features/StackScripts/stackScriptUtils';
import { CreateTypes } from 'src/store/linodeCreate/linodeCreate.actions';
import {
  LinodeActionsProps,
  withLinodeActions,
} from 'src/store/linodes/linode.containers';
import { upsertLinode } from 'src/store/linodes/linodes.actions';
import { ExtendedType } from 'src/store/linodeType/linodeType.reducer';
import { MapState } from 'src/store/types';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { sendCreateLinodeEvent } from 'src/utilities/ga';
import { getParamsFromUrl } from 'src/utilities/queryParams';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { validatePassword } from 'src/utilities/validatePassword';
import LinodeCreate from './LinodeCreate';
import {
  HandleSubmit,
  Info,
  ReduxStateProps,
  ReduxStatePropsAndSSHKeys,
  TypeInfo,
  WithLinodesProps,
  WithRegionsProps,
  WithTypesProps,
} from './types';
import { getRegionIDFromLinodeID } from './utilities';

const DEFAULT_IMAGE = 'linode/debian10';

interface State {
  selectedImageID?: string;
  selectedRegionID?: string;
  selectedTypeID?: string;
  selectedLinodeID?: number;
  selectedBackupID?: number;
  availableUserDefinedFields?: UserDefinedField[];
  availableStackScriptImages?: Image[];
  selectedStackScriptID?: number;
  selectedStackScriptLabel?: string;
  selectedStackScriptUsername?: string;
  selectedDiskSize?: number;
  label: string;
  backupsEnabled: boolean;
  privateIPEnabled: boolean;
  password: string;
  udfs?: any;
  tags?: Tag[];
  errors?: APIError[];
  formIsSubmitting: boolean;
  appInstances?: StackScript[];
  appInstancesLoading: boolean;
  appInstancesError?: string;
  disabledClasses?: LinodeTypeClass[];
  attachedVLANLabel: string;
  vlanIPAMAddress: string | null;
}

type CombinedProps = WithSnackbarProps &
  CreateType &
  LinodeActionsProps &
  WithImages &
  ImagesDispatch &
  WithTypesProps &
  WithLinodesProps &
  WithRegionsProps &
  ReduxStatePropsAndSSHKeys &
  DispatchProps &
  LabelProps &
  FeatureFlagConsumerProps &
  RouteComponentProps<{}>;

const defaultState: State = {
  privateIPEnabled: false,
  backupsEnabled: false,
  label: '',
  password: '',
  selectedImageID: undefined,
  selectedBackupID: undefined,
  selectedDiskSize: undefined,
  selectedLinodeID: undefined,
  selectedStackScriptID: undefined,
  selectedStackScriptLabel: '',
  selectedStackScriptUsername: '',
  selectedRegionID: undefined,
  selectedTypeID: undefined,
  tags: [],
  udfs: undefined,
  formIsSubmitting: false,
  errors: undefined,
  appInstancesLoading: false,
  attachedVLANLabel: '',
  vlanIPAMAddress: null,
};

const getDisabledClasses = (regionID: string, regions: Region[] = []) => {
  const selectedRegion = regions.find(
    (thisRegion) => thisRegion.id === regionID
  );
  /** This approach is fine for just GPUs, which is all we have capability info for at this time.
   *  Refactor to a switch or .map() if additional support is needed.
   */
  return selectedRegion?.capabilities.includes('GPU Linodes')
    ? []
    : (['gpu'] as LinodeTypeClass[]);
};

const trimOneClickFromLabel = (script: StackScript) => {
  return {
    ...script,
    label: script.label.replace('One-Click', ''),
  };
};

const nonImageCreateTypes = ['fromStackScript', 'fromBackup', 'fromLinode'];

const isNonDefaultImageType = (prevType: string, type: string) => {
  return nonImageCreateTypes.some(
    (thisEntry) => prevType !== thisEntry && type === thisEntry
  );
};

class LinodeCreateContainer extends React.PureComponent<CombinedProps, State> {
  params = getParamsFromUrl(this.props.location.search);

  state: State = {
    ...defaultState,
    // These can be passed in as query params
    selectedTypeID: this.params.typeID,
    selectedRegionID: this.params.regionID,
    selectedImageID: this.params.imageID ?? DEFAULT_IMAGE,
    // @todo: Abstract and test. UPDATE 5/21/20: lol what does this mean
    selectedLinodeID: isNaN(+this.params.linodeID)
      ? undefined
      : +this.params.linodeID,
    selectedBackupID: isNaN(+this.params.backupID)
      ? undefined
      : +this.params.backupID,
    disabledClasses: [],
  };

  componentDidUpdate(prevProps: CombinedProps) {
    /**
     * When switching to a creation flow where
     * having a pre-selected image is problematic,
     * deselect it.
     */
    if (isNonDefaultImageType(prevProps.createType, this.props.createType)) {
      this.setState({ selectedImageID: undefined });
    }
  }

  componentDidMount() {
    // Allowed apps include the base set of original apps + anything LD tells us to show
    const newApps = this.props.flags.oneClickApps || [];
    const allowedApps = Object.keys({ ...baseApps, ...newApps });
    if (nonImageCreateTypes.includes(this.props.createType)) {
      // If we're navigating directly to e.g. the clone page, don't select an image by default
      this.setState({ selectedImageID: undefined });
    }
    this.setState({ appInstancesLoading: true });
    getOneClickApps()
      // Don't display One-Click Helpers to the user
      // Filter out any apps that we don't have info for
      .then((response) =>
        response.data.filter((script) => {
          return (
            !script.label.match(/helpers/i) &&
            allowedApps.includes(String(script.id))
          );
        })
      )
      .then((response) =>
        response.map((stackscript) => trimOneClickFromLabel(stackscript))
      )
      .then((response) => {
        this.setState({
          appInstancesLoading: false,
          appInstances: response,
        });
      })
      .catch((_) => {
        this.setState({
          appInstancesLoading: false,
          appInstancesError: 'There was an error loading Marketplace Apps.',
        });
      });

    // If we haven't requested images yet (or in a while), request them
    if (
      Date.now() - this.props.imagesLastUpdated > REFRESH_INTERVAL &&
      !this.props.imagesLoading
    ) {
      this.props.requestImages();
    }
  }

  clearCreationState = () => {
    this.props.resetSSHKeys();
    this.setState(defaultState);
  };

  setImageID = (id: string | undefined) => {
    if (typeof id === 'undefined') {
      /** In this case we also clear any VLAN input, since VLANs are incompatible with empty Linodes */
      return this.setState({
        selectedImageID: undefined,
        attachedVLANLabel: '',
        vlanIPAMAddress: '',
      });
    }

    return this.setState({ selectedImageID: id });
  };

  setBackupID = (id: number) => {
    this.setState({ selectedBackupID: id });
  };

  setRegionID = (id: string) => {
    const disabledClasses = getDisabledClasses(id, this.props.regionsData);
    this.setState({ selectedRegionID: id, disabledClasses });
  };

  setTypeID = (id: string) => {
    if (/metal/.test(id)) {
      // VLANs and backups don't work with bare metal;
      // reset those values.
      this.setState({
        selectedTypeID: id,
        vlanIPAMAddress: '',
        attachedVLANLabel: '',
        backupsEnabled: false,
      });
    } else {
      this.setState({
        selectedTypeID: id,
      });
    }
  };

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
        selectedRegionID,
      });
    }
  };

  setStackScript = (
    id: number,
    label: string,
    username: string,
    userDefinedFields: UserDefinedField[],
    images: Image[],
    defaultData?: any
  ) => {
    /**
     * If we're switching from one Marketplace app to another,
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
      errors: undefined,
    });
  };

  setDiskSize = (size: number) => this.setState({ selectedDiskSize: size });

  setPassword = (password: string) => this.setState({ password });

  toggleBackupsEnabled = () =>
    this.setState({ backupsEnabled: !this.state.backupsEnabled });

  togglePrivateIPEnabled = () =>
    this.setState({ privateIPEnabled: !this.state.privateIPEnabled });

  setTags = (tags: Tag[]) => this.setState({ tags });

  setUDFs = (udfs: any) => this.setState({ udfs });

  handleVLANChange = (updatedInterface: Interface) => {
    this.setState({
      attachedVLANLabel: updatedInterface.label,
      vlanIPAMAddress: updatedInterface.ipam_address,
    });
  };

  generateLabel = () => {
    const { createType, getLabel, imagesData, regionsData } = this.props;
    const {
      selectedLinodeID,
      selectedImageID,
      selectedRegionID,
      selectedStackScriptLabel,
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
      const selectedImage = imagesData![selectedImageID];
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

      if (createType === 'fromApp') {
        // All 1-clicks are Debian so this isn't useful information.
        arg1 = '';
      }
    }

    if (selectedRegionID) {
      /**
       * safe to ignore possibility of "undefined"
       * null checking happens in CALinodeCreate
       */
      const selectedRegion = regionsData!.find(
        (region) => region.id === selectedRegionID
      );

      arg2 = selectedRegion ? selectedRegion.id : '';
    }

    if (createType === 'fromLinode') {
      // @todo handle any other custom label cases we'd like to have here
      arg1 =
        this.props.linodesData?.find(
          (thisLinode) => thisLinode.id === selectedLinodeID
        )?.label ?? arg1; // Use the label of whatever we're cloning
      arg2 = 'clone';
      arg3 = '';
    }

    if (createType === 'fromBackup') {
      arg3 = 'backup';
    }

    return getLabel(arg1, arg2, arg3);
  };

  submitForm: HandleSubmit = (_payload, linodeID?: number) => {
    const { createType } = this.props;
    const payload = { ..._payload };
    /**
     * Do manual password validation (someday we'll use Formik and
     * not need this). Only run this check if a password is present
     * on the payload --
     * Yup schema in the JS client will determine if a password
     * is required.
     *
     * The downside of this approach is that only the password error
     * will be displayed, even if other required fields are missing.
     */

    if (payload.root_pass) {
      const passwordError = validatePassword(payload.root_pass);

      if (passwordError) {
        this.setState({
          errors: [
            {
              field: 'root_pass',
              reason: passwordError,
            },
          ],
        });
        return;
      }
    }

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
              field: 'linode_id',
            },
          ],
        }),
        () => scrollErrorIntoView()
      );
    }

    if (createType === 'fromBackup' && !this.state.selectedBackupID) {
      /* a backup selection is also required */
      this.setState(
        {
          errors: [{ field: 'backup_id', reason: 'You must select a Backup.' }],
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
              field: 'stackscript_id',
            },
          ],
        }),
        () => scrollErrorIntoView()
      );
    }

    if (createType === 'fromApp' && !this.state.selectedStackScriptID) {
      return this.setState(
        () => ({
          errors: [
            {
              reason: 'You must select a Marketplace App.',
              field: 'stackscript_id',
            },
          ],
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
      .then((response: Linode) => {
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
            variant: 'success',
          }
        );

        /** reset the Events polling */
        resetEventsPolling();

        /** send the user to the Linode detail page */
        this.props.history.push(`/linodes/${response.id}`);
      })
      .catch((error) => {
        this.setState(
          () => ({
            errors: getAPIErrorOrDefault(error),
            formIsSubmitting: false,
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
    return this.reshapeTypeInfo(
      this.props.typesData!.find((type) => type.id === selectedTypeID)
    );
  };

  reshapeTypeInfo = (type?: ExtendedType): TypeInfo | undefined => {
    return (
      type && {
        title: type.label,
        details: `${typeLabelDetails(type.memory, type.disk, type.vcpus)}`,
        monthly: type.price.monthly,
        backupsMonthly: type.addons.backups.price.monthly,
      }
    );
  };

  getRegionInfo = (): Info | undefined => {
    const { selectedRegionID } = this.state;

    if (!selectedRegionID) {
      return;
    }

    const selectedRegion = this.props.regionsData.find(
      (region) => region.id === selectedRegionID
    );

    return (
      selectedRegion && {
        title: selectedRegion.country.toUpperCase(),
        details: selectedRegion.display,
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
    const selectedImage = this.props.imagesData![selectedImageID];

    return (
      selectedImage && {
        title: `${selectedImage.vendor || selectedImage.label}`,
        details: `${selectedImage.vendor ? selectedImage.label : ''}`,
      }
    );
  };

  render() {
    const {
      enqueueSnackbar,
      closeSnackbar,
      regionsData,
      typesData,
      ...restOfProps
    } = this.props;
    const { label, udfs: selectedUDFs, ...restOfState } = this.state;

    // If the selected type is a GPU plan, only display region
    // options that support GPUs.
    const selectedType = this.props.typesData?.find(
      (thisType) => thisType.id === this.state.selectedTypeID
    );

    const filteredRegions =
      selectedType?.class === 'gpu'
        ? regionsData?.filter((thisRegion) => {
            return thisRegion.capabilities.includes('GPU Linodes');
          })
        : regionsData;

    const regionHelperText =
      (filteredRegions?.length ?? 0) !== (regionsData?.length ?? 0)
        ? 'Only regions that support your selected plan are displayed.'
        : undefined;

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Create a Linode" />
        <Grid container spacing={0} className="m0">
          <Grid item xs={12} className="p0">
            <Breadcrumb
              pathname={'/linodes/create'}
              labelTitle="Create"
              data-qa-create-linode-header
            />
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
            regionsData={filteredRegions!}
            regionHelperText={regionHelperText}
            typesData={typesData}
            vlanLabel={this.state.attachedVLANLabel}
            ipamAddress={this.state.vlanIPAMAddress}
            handleVLANChange={this.handleVLANChange}
            {...restOfProps}
            {...restOfState}
          />
        </Grid>
      </React.Fragment>
    );
  }
}

interface CreateType {
  createType: CreateTypes;
}

const mapStateToProps: MapState<ReduxStateProps & CreateType, CombinedProps> = (
  state
) => ({
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
  createType: state.createLinode.type,
});

interface DispatchProps {
  upsertLinode: (l: Linode) => void;
}

const connected = connect(mapStateToProps, { upsertLinode });

export default recompose<CombinedProps, {}>(
  deepCheckRouter(
    (oldProps, newProps) =>
      oldProps.location.search !== newProps.location.search,
    true
  ),
  withImages(),
  withLinodes((ownProps, linodesData, linodesLoading, linodesError) => ({
    linodesData,
    linodesLoading,
    linodesError,
  })),
  withRegions,
  withTypes,
  withLinodeActions,
  connected,
  withSnackbar,
  userSSHKeyHoc,
  withLabelGenerator,
  withFlags
)(LinodeCreateContainer);

const actionsAndLabels = {
  fromApp: { action: 'one-click', labelPayloadKey: 'stackscript_id' },
  fromBackup: { action: 'backup', labelPayloadKey: 'backup_id' },
  fromImage: { action: 'image', labelPayloadKey: 'image' },
  fromLinode: { action: 'clone', labelPayloadKey: 'type' },
  fromStackScript: { action: 'stackscript', labelPayloadKey: 'stackscript_id' },
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
