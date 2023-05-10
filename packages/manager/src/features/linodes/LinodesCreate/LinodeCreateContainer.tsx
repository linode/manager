import { Agreements, signAgreement } from '@linode/api-v4/lib/account';
import { CreateLinodeSchema } from '@linode/validation/lib/linodes.schema';
import { convertYupToLinodeErrors } from '@linode/api-v4/lib/request';
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
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { compose as recompose } from 'recompose';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from '@mui/material/Unstable_Grid2';
import { Tag } from 'src/components/TagsInput/TagsInput';
import {
  withProfile,
  WithProfileProps,
} from 'src/containers/profile.container';
import withImages, {
  DefaultProps as ImagesProps,
} from 'src/containers/images.container';
import { withRegions, RegionsProps } from 'src/containers/regions.container';
import { withTypes, WithTypesProps } from 'src/containers/types.container';
import withFlags, {
  FeatureFlagConsumerProps,
} from 'src/containers/withFeatureFlagConsumer.container';
import withLinodes from 'src/containers/withLinodes.container';
import { resetEventsPolling } from 'src/eventsPolling';
import withAgreements, {
  AgreementsProps,
} from 'src/features/Account/Agreements/withAgreements';
import withLabelGenerator, {
  LabelProps,
} from 'src/features/linodes/LinodesCreate/withLabelGenerator';
import { baseApps } from 'src/features/StackScripts/stackScriptUtils';
import {
  queryKey as accountAgreementsQueryKey,
  reportAgreementSigningError,
} from 'src/queries/accountAgreements';
import { simpleMutationHandlers } from 'src/queries/base';
import { getAllOCAsRequest } from 'src/queries/stackscripts';
import { CreateTypes } from 'src/store/linodeCreate/linodeCreate.actions';
import {
  LinodeActionsProps,
  withLinodeActions,
} from 'src/store/linodes/linode.containers';
import { upsertLinode } from 'src/store/linodes/linodes.actions';
import { MapState } from 'src/store/types';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { isEURegion } from 'src/utilities/formatRegion';
import { sendCreateLinodeEvent, sendEvent } from 'src/utilities/ga';
import { getParamsFromUrl } from 'src/utilities/queryParams';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { validatePassword } from 'src/utilities/validatePassword';
import LinodeCreate from './LinodeCreate';
import {
  HandleSubmit,
  LinodeCreateValidation,
  Info,
  TypeInfo,
  WithLinodesProps,
} from './types';
import { getRegionIDFromLinodeID } from './utilities';
import { ExtendedType, extendType } from 'src/utilities/extendType';
import LandingHeader from 'src/components/LandingHeader';
import {
  withQueryClient,
  WithQueryClientProps,
} from 'src/containers/withQueryClient.container';
import {
  withAccountSettings,
  WithAccountSettingsProps,
} from 'src/containers/accountSettings.container';

const DEFAULT_IMAGE = 'linode/debian11';

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
  showAgreement: boolean;
  showApiAwarenessModal: boolean;
  signedAgreement: boolean;
  formIsSubmitting: boolean;
  appInstances?: StackScript[];
  appInstancesLoading: boolean;
  appInstancesError?: string;
  disabledClasses?: LinodeTypeClass[];
  attachedVLANLabel: string | null;
  vlanIPAMAddress: string | null;
  authorized_users: string[];
  userData: string | undefined;
}

type CombinedProps = CreateType &
  LinodeActionsProps &
  ImagesProps &
  WithTypesProps &
  WithLinodesProps &
  RegionsProps &
  DispatchProps &
  LabelProps &
  FeatureFlagConsumerProps &
  RouteComponentProps<{}, any, any> &
  WithProfileProps &
  AgreementsProps &
  WithQueryClientProps &
  WithAccountSettingsProps;

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
  selectedRegionID: '',
  selectedTypeID: undefined,
  tags: [],
  authorized_users: [],
  udfs: undefined,
  showAgreement: false,
  signedAgreement: false,
  formIsSubmitting: false,
  errors: undefined,
  appInstancesLoading: false,
  attachedVLANLabel: '',
  vlanIPAMAddress: null,
  showApiAwarenessModal: false,
  userData: undefined,
};

const getDisabledClasses = (regionID: string, regions: Region[] = []) => {
  const selectedRegion = regions.find(
    (thisRegion) => thisRegion.id === regionID
  );

  const disabledClasses: LinodeTypeClass[] = [];

  if (!selectedRegion?.capabilities.includes('GPU Linodes')) {
    disabledClasses.push('gpu');
  }

  if (!selectedRegion?.capabilities.includes('Bare Metal')) {
    disabledClasses.push('metal');
  }

  return disabledClasses;
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
  params = getParamsFromUrl(this.props.location.search) as Record<
    string,
    string
  >;

  state: State = {
    ...defaultState,
    // These can be passed in as query params
    selectedTypeID: this.params.typeID,
    selectedRegionID: this.params.regionID,
    selectedImageID: this.params.imageID ?? DEFAULT_IMAGE,
    // @todo: Abstract and test. UPDATE 5/21/20: lol what does this mean. UPDATE 3/16/23 lol what
    selectedLinodeID: isNaN(+this.params.linodeID)
      ? undefined
      : +this.params.linodeID,
    selectedBackupID: isNaN(+this.params.backupID)
      ? undefined
      : +this.params.backupID,
    showAgreement: Boolean(
      !this.props.profile.data?.restricted &&
        isEURegion(this.params.regionID) &&
        !this.props.agreements?.data?.eu_model
    ),
    signedAgreement: false,
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

    // Update search params for Linode Clone
    if (prevProps.location.search !== this.props.history.location.search) {
      this.params = getParamsFromUrl(this.props.location.search) as Record<
        string,
        string
      >;
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

    this.props.queryClient
      .fetchQuery('stackscripts-oca-all', () => getAllOCAsRequest())
      .then((res: StackScript[]) => {
        // Don't display One-Click Helpers to the user
        // Filter out any apps that we don't have info for
        const filteredApps = res.filter((script) => {
          return (
            !script.label.match(/helpers/i) &&
            allowedApps.includes(String(script.id))
          );
        });
        const trimmedApps = filteredApps.map((stackscript) =>
          trimOneClickFromLabel(stackscript)
        );
        this.setState({
          appInstancesLoading: false,
          appInstances: trimmedApps,
        });
      })
      .catch((_) => {
        this.setState({
          appInstancesLoading: false,
          appInstancesError: 'There was an error loading Marketplace Apps.',
        });
      });
  }

  clearCreationState = () => {
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
    this.setState({
      selectedRegionID: id,
      showAgreement: Boolean(
        !this.props.profile.data?.restricted &&
          isEURegion(id) &&
          !this.props.agreements?.data?.eu_model
      ),
      disabledClasses,
    });
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

    const stackScriptLabel = defaultData?.cluster_size
      ? `${label} Cluster`
      : label;

    this.setState({
      selectedStackScriptID: id,
      selectedStackScriptLabel: stackScriptLabel,
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

  setAuthorizedUsers = (usernames: string[]) =>
    this.setState({ authorized_users: usernames });

  setUserData = (userData: string) => this.setState({ userData });

  handleVLANChange = (updatedInterface: Interface) => {
    this.setState({
      attachedVLANLabel: updatedInterface.label,
      vlanIPAMAddress: updatedInterface.ipam_address,
    });
  };

  handleAgreementChange = () => {
    this.setState((prevState) => ({
      signedAgreement: !prevState.signedAgreement,
    }));
  };

  handleShowApiAwarenessModal = () => {
    this.setState((prevState) => ({
      showApiAwarenessModal: !prevState.showApiAwarenessModal,
    }));
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
    const { signedAgreement } = this.state;
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
        this.setState(
          {
            errors: [
              {
                field: 'root_pass',
                reason: passwordError,
              },
            ],
          },
          () => {
            scrollErrorIntoView();
          }
        );
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

        if (signedAgreement) {
          this.props.queryClient.executeMutation<
            {},
            APIError[],
            Partial<Agreements>
          >({
            variables: { eu_model: true, privacy_policy: true },
            mutationFn: signAgreement,
            mutationKey: accountAgreementsQueryKey,
            onError: reportAgreementSigningError,
            ...simpleMutationHandlers(
              accountAgreementsQueryKey,
              this.props.queryClient
            ),
          });
        }

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
        enqueueSnackbar(`Your Linode ${response.label} is being created.`, {
          variant: 'success',
        });

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

  checkValidation: LinodeCreateValidation = (payload) => {
    try {
      CreateLinodeSchema.validateSync(payload, { abortEarly: false });
      // reset errors to default state
      this.setState({ errors: undefined, showApiAwarenessModal: true });
    } catch (error) {
      const processedErrors = convertYupToLinodeErrors(error);
      this.setState(
        () => ({
          errors: getAPIErrorOrDefault(processedErrors),
          formIsSubmitting: false,
        }),
        () => scrollErrorIntoView()
      );
    }
  };
  getBackupsMonthlyPrice = (): number | undefined | null => {
    const type = this.getTypeInfo();

    return !type ? undefined : type.backupsMonthly;
  };

  getTypeInfo = (): TypeInfo => {
    const { selectedTypeID } = this.state;
    const selectedType = this.props.typesData?.find(
      (type) => type.id === selectedTypeID
    );
    return this.reshapeTypeInfo(
      selectedType ? extendType(selectedType) : undefined
    );
  };

  reshapeTypeInfo = (type?: ExtendedType): TypeInfo | undefined => {
    return (
      type && {
        title: type.formattedLabel,
        details: `$${type.price.monthly}/month`,
        monthly: type.price.monthly ?? 0,
        hourly: type.price.hourly ?? 0,
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
        title: selectedRegion.label,
      }
    );
  };

  getImageInfo = (): Info | undefined => {
    const { selectedImageID } = this.state;

    if (!selectedImageID) {
      return undefined;
    }

    const selectedImage = this.props.imagesData[selectedImageID];

    if (!selectedImage) {
      return undefined;
    }

    const { vendor, label } = selectedImage;

    return { title: `${label ? label : vendor ? vendor : ''}` };
  };

  render() {
    const {
      profile,
      grants,
      regionsData,
      typesData,
      ...restOfProps
    } = this.props;
    const { label, udfs: selectedUDFs, ...restOfState } = this.state;

    const extendedTypeData = typesData?.map(extendType);

    const userCannotCreateLinode =
      Boolean(profile.data?.restricted) && !grants.data?.global.add_linodes;

    // If the selected type is a GPU plan, only display region
    // options that support GPUs.
    const selectedType = extendedTypeData?.find(
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
          <LandingHeader
            title="Create"
            docsLabel="Getting Started"
            docsLink="https://www.linode.com/docs/guides/platform/get-started/"
            onDocsClick={() => {
              sendEvent({
                category: 'Linode Create Flow',
                action: 'Click:link',
                label: 'Getting Started',
              });
            }}
          />
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
            checkValidation={this.checkValidation}
            resetCreationState={this.clearCreationState}
            setBackupID={this.setBackupID}
            regionsData={filteredRegions!}
            regionHelperText={regionHelperText}
            typesData={extendedTypeData}
            vlanLabel={this.state.attachedVLANLabel}
            ipamAddress={this.state.vlanIPAMAddress}
            handleVLANChange={this.handleVLANChange}
            handleAgreementChange={this.handleAgreementChange}
            handleShowApiAwarenessModal={this.handleShowApiAwarenessModal}
            userCannotCreateLinode={userCannotCreateLinode}
            accountBackupsEnabled={
              this.props.accountSettings.data?.backups_enabled ?? false
            }
            setAuthorizedUsers={this.setAuthorizedUsers}
            updateUserData={this.setUserData}
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

const mapStateToProps: MapState<CreateType, CombinedProps> = (state) => ({
  createType: state.createLinode.type,
});

interface DispatchProps {
  upsertLinode: (l: Linode) => void;
}

const connected = connect(mapStateToProps, { upsertLinode });

export default recompose<CombinedProps, {}>(
  withImages,
  withLinodes((ownProps, linodesData, linodesLoading, linodesError) => ({
    linodesData,
    linodesLoading,
    linodesError,
  })),
  withRegions,
  withTypes,
  withLinodeActions,
  connected,
  withLabelGenerator,
  withFlags,
  withProfile,
  withAgreements,
  withQueryClient,
  withAccountSettings
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
