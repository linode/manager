import { Agreements, signAgreement } from '@linode/api-v4/lib/account';
import { Image } from '@linode/api-v4/lib/images';
import { Region } from '@linode/api-v4/lib/regions';
import { convertYupToLinodeErrors } from '@linode/api-v4/lib/request';
import { StackScript, UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import { APIError } from '@linode/api-v4/lib/types';
import { CreateLinodeSchema } from '@linode/validation/lib/linodes.schema';
import Grid from '@mui/material/Unstable_Grid2';
import { WithSnackbarProps, withSnackbar } from 'notistack';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { compose as recompose } from 'recompose';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { Tag } from 'src/components/TagsInput/TagsInput';
import {
  WithAccountSettingsProps,
  withAccountSettings,
} from 'src/containers/accountSettings.container';
import withImages, {
  DefaultProps as ImagesProps,
} from 'src/containers/images.container';
import {
  WithProfileProps,
  withProfile,
} from 'src/containers/profile.container';
import { RegionsProps, withRegions } from 'src/containers/regions.container';
import { WithTypesProps, withTypes } from 'src/containers/types.container';
import withFlags, {
  FeatureFlagConsumerProps,
} from 'src/containers/withFeatureFlagConsumer.container';
import {
  WithLinodesProps,
  withLinodes,
} from 'src/containers/withLinodes.container';
import {
  WithQueryClientProps,
  withQueryClient,
} from 'src/containers/withQueryClient.container';
import { resetEventsPolling } from 'src/eventsPolling';
import withAgreements, {
  AgreementsProps,
} from 'src/features/Account/Agreements/withAgreements';
import { baseApps } from 'src/features/StackScripts/stackScriptUtils';
import {
  queryKey as accountAgreementsQueryKey,
  reportAgreementSigningError,
} from 'src/queries/accountAgreements';
import { simpleMutationHandlers } from 'src/queries/base';
import { getAllOCAsRequest } from 'src/queries/stackscripts';
import { CreateTypes } from 'src/store/linodeCreate/linodeCreate.actions';
import { MapState } from 'src/store/types';
import {
  sendCreateLinodeEvent,
  sendLinodeCreateFlowDocsClickEvent,
} from 'src/utilities/analytics';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { ExtendedType, extendType } from 'src/utilities/extendType';
import { isEURegion } from 'src/utilities/formatRegion';
import { getLinodeRegionPrice } from 'src/utilities/pricing/linodes';
import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { validatePassword } from 'src/utilities/validatePassword';

import LinodeCreate from './LinodeCreate';
import { deriveDefaultLabel } from './deriveDefaultLabel';
import { HandleSubmit, Info, LinodeCreateValidation, TypeInfo } from './types';
import { getRegionIDFromLinodeID } from './utilities';

import type {
  CreateLinodeRequest,
  Interface,
  Linode,
  LinodeTypeClass,
  PriceObject,
} from '@linode/api-v4/lib/linodes';

const DEFAULT_IMAGE = 'linode/debian11';

interface State {
  appInstances?: StackScript[];
  appInstancesError?: string;
  appInstancesLoading: boolean;
  attachedVLANLabel: null | string;
  authorized_users: string[];
  availableStackScriptImages?: Image[];
  availableUserDefinedFields?: UserDefinedField[];
  backupsEnabled: boolean;
  customLabel?: string;
  dcSpecificPricing?: boolean;
  disabledClasses?: LinodeTypeClass[];
  errors?: APIError[];
  formIsSubmitting: boolean;
  password: string;
  privateIPEnabled: boolean;
  selectedBackupID?: number;
  selectedDiskSize?: number;
  selectedImageID?: string;
  selectedLinodeID?: number;
  selectedRegionID?: string;
  selectedStackScriptID?: number;
  selectedStackScriptLabel?: string;
  selectedStackScriptUsername?: string;
  selectedTypeID?: string;
  showAgreement: boolean;
  showApiAwarenessModal: boolean;
  signedAgreement: boolean;
  tags?: Tag[];
  udfs?: any;
  userData: string | undefined;
  vlanIPAMAddress: null | string;
}

type CombinedProps = WithSnackbarProps &
  CreateType &
  ImagesProps &
  WithTypesProps &
  WithLinodesProps &
  RegionsProps &
  FeatureFlagConsumerProps &
  RouteComponentProps<{}, any, any> &
  WithProfileProps &
  AgreementsProps &
  WithQueryClientProps &
  WithAccountSettingsProps;

const defaultState: State = {
  appInstancesLoading: false,
  attachedVLANLabel: '',
  authorized_users: [],
  backupsEnabled: false,
  customLabel: undefined,
  dcSpecificPricing: false,
  disabledClasses: [],
  errors: undefined,
  formIsSubmitting: false,
  password: '',
  privateIPEnabled: false,
  selectedBackupID: undefined,
  selectedDiskSize: undefined,
  selectedImageID: undefined,
  selectedLinodeID: undefined,
  selectedRegionID: '',
  selectedStackScriptID: undefined,
  selectedStackScriptLabel: '',
  selectedStackScriptUsername: '',
  selectedTypeID: undefined,
  showAgreement: false,
  showApiAwarenessModal: false,
  signedAgreement: false,
  tags: [],
  udfs: undefined,
  userData: undefined,
  vlanIPAMAddress: null,
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
          appInstances: trimmedApps,
          appInstancesLoading: false,
        });
      })
      .catch((_) => {
        this.setState({
          appInstancesError: 'There was an error loading Marketplace Apps.',
          appInstancesLoading: false,
        });
      });
  }

  componentDidUpdate(prevProps: CombinedProps) {
    /**
     * The flag state gets lost when navigating between create types,
     * so we need to keep it up to date here.
     */
    this.setState({ dcSpecificPricing: this.props.flags.dcSpecificPricing });

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
      this.params = getQueryParamsFromQueryString(
        this.props.location.search
      ) as Record<string, string>;
    }
  }

  render() {
    const {
      grants,
      profile,
      regionsData,
      typesData,
      ...restOfProps
    } = this.props;
    const { udfs: selectedUDFs, ...restOfState } = this.state;

    const extendedTypeData = typesData?.map(extendType);

    const userCannotCreateLinode =
      Boolean(profile.data?.restricted) && !grants.data?.global.add_linodes;

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Create a Linode" />
        <ProductInformationBanner bannerLocation="LinodeCreate" />
        <Grid className="m0" container spacing={0}>
          <LandingHeader
            onDocsClick={() =>
              sendLinodeCreateFlowDocsClickEvent('Getting Started')
            }
            docsLabel="Getting Started"
            docsLink="https://www.linode.com/docs/guides/platform/get-started/"
            title="Create"
          />
          <LinodeCreate
            accountBackupsEnabled={
              this.props.accountSettings.data?.backups_enabled ?? false
            }
            checkValidation={this.checkValidation}
            handleAgreementChange={this.handleAgreementChange}
            handleSelectUDFs={this.setUDFs}
            handleShowApiAwarenessModal={this.handleShowApiAwarenessModal}
            handleSubmitForm={this.submitForm}
            handleVLANChange={this.handleVLANChange}
            imageDisplayInfo={this.getImageInfo()}
            ipamAddress={this.state.vlanIPAMAddress}
            label={this.generateLabel()}
            regionDisplayInfo={this.getRegionInfo()}
            regionsData={regionsData}
            resetCreationState={this.clearCreationState}
            selectedUDFs={selectedUDFs}
            setAuthorizedUsers={this.setAuthorizedUsers}
            setBackupID={this.setBackupID}
            toggleBackupsEnabled={this.toggleBackupsEnabled}
            togglePrivateIPEnabled={this.togglePrivateIPEnabled}
            typeDisplayInfo={this.getTypeInfo()}
            typesData={extendedTypeData}
            updateDiskSize={this.setDiskSize}
            updateImageID={this.setImageID}
            updateLabel={this.updateCustomLabel}
            updateLinodeID={this.setLinodeID}
            updatePassword={this.setPassword}
            updateRegionID={this.setRegionID}
            updateStackScript={this.setStackScript}
            updateTags={this.setTags}
            updateTypeID={this.setTypeID}
            updateUserData={this.setUserData}
            userCannotCreateLinode={userCannotCreateLinode}
            vlanLabel={this.state.attachedVLANLabel}
            {...restOfProps}
            {...restOfState}
          />
        </Grid>
      </React.Fragment>
    );
  }

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

  clearCreationState = () => {
    this.setState(defaultState);
  };

  generateLabel = () => {
    const { createType, imagesData, regionsData } = this.props;
    const {
      customLabel,
      selectedImageID,
      selectedLinodeID,
      selectedRegionID,
      selectedStackScriptLabel,
    } = this.state;

    if (customLabel !== undefined) {
      return customLabel;
    }

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

    return deriveDefaultLabel(
      [arg1, arg2, arg3],
      this.props.linodesData?.map((linode) => linode.label) ?? []
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

    const { label, vendor } = selectedImage;

    return { title: `${label ? label : vendor ? vendor : ''}` };
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

  getTypeInfo = (): TypeInfo => {
    const { selectedTypeID } = this.state;
    const selectedType = this.props.typesData?.find(
      (type) => type.id === selectedTypeID
    );
    return this.reshapeTypeInfo(
      selectedType ? extendType(selectedType) : undefined
    );
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

  handleVLANChange = (updatedInterface: Interface) => {
    this.setState({
      attachedVLANLabel: updatedInterface.label,
      vlanIPAMAddress: updatedInterface.ipam_address,
    });
  };

  params = getQueryParamsFromQueryString(this.props.location.search) as Record<
    string,
    string
  >;

  reshapeTypeInfo = (type?: ExtendedType): TypeInfo | undefined => {
    const { dcSpecificPricing, selectedRegionID } = this.state;

    const linodePrice: PriceObject =
      dcSpecificPricing && type && selectedRegionID
        ? getLinodeRegionPrice(type, selectedRegionID)
        : type
        ? type.price
        : { hourly: 0, monthly: 0 }; // TODO: M3-7063 (defaults)

    return (
      type && {
        details: `$${linodePrice?.monthly}/month`,
        hourly: linodePrice?.hourly ?? 0,
        monthly: linodePrice?.monthly ?? 0,
        title: type.formattedLabel,
      }
    );
  };

  setAuthorizedUsers = (usernames: string[]) =>
    this.setState({ authorized_users: usernames });

  setBackupID = (id: number) => {
    this.setState({ selectedBackupID: id });
  };

  setDiskSize = (size: number) => this.setState({ selectedDiskSize: size });

  setImageID = (id: string | undefined) => {
    if (typeof id === 'undefined') {
      /** In this case we also clear any VLAN input, since VLANs are incompatible with empty Linodes */
      return this.setState({
        attachedVLANLabel: '',
        selectedImageID: undefined,
        vlanIPAMAddress: '',
      });
    }

    return this.setState({ selectedImageID: id });
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
        selectedBackupID: undefined,
        selectedDiskSize: diskSize,
        selectedLinodeID: id,
        selectedRegionID,
        selectedTypeID: undefined,
      });
    }
  };

  setPassword = (password: string) => this.setState({ password });

  setRegionID = (id: string) => {
    const disabledClasses = getDisabledClasses(id, this.props.regionsData);
    this.setState({
      disabledClasses,
      selectedRegionID: id,
      showAgreement: Boolean(
        !this.props.profile.data?.restricted &&
          isEURegion(id) &&
          !this.props.agreements?.data?.eu_model
      ),
    });
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
      availableStackScriptImages: images,
      availableUserDefinedFields: userDefinedFields,
      errors: undefined,
      /** reset image because stackscript might not be compatible with selected one */
      selectedImageID: defaultImage,
      selectedStackScriptID: id,
      selectedStackScriptLabel: stackScriptLabel,
      selectedStackScriptUsername: username,
      udfs: defaultData,
    });
  };

  setTags = (tags: Tag[]) => this.setState({ tags });

  setTypeID = (id: string) => {
    if (/metal/.test(id)) {
      // VLANs and backups don't work with bare metal;
      // reset those values.
      this.setState({
        attachedVLANLabel: '',
        backupsEnabled: false,
        selectedTypeID: id,
        vlanIPAMAddress: '',
      });
    } else {
      this.setState({
        selectedTypeID: id,
      });
    }
  };

  setUDFs = (udfs: any) => this.setState({ udfs });

  setUserData = (userData: string) => this.setState({ userData });

  state: State = {
    ...defaultState,
    disabledClasses: [],
    selectedBackupID: isNaN(+this.params.backupID)
      ? undefined
      : +this.params.backupID,
    selectedImageID: this.params.imageID ?? DEFAULT_IMAGE,
    // @todo: Abstract and test. UPDATE 5/21/20: lol what does this mean. UPDATE 3/16/23 lol what
    selectedLinodeID: isNaN(+this.params.linodeID)
      ? undefined
      : +this.params.linodeID,
    selectedRegionID: this.params.regionID,
    // These can be passed in as query params
    selectedTypeID: this.params.typeID,
    showAgreement: Boolean(
      !this.props.profile.data?.restricted &&
        isEURegion(this.params.regionID) &&
        !this.props.agreements?.data?.eu_model
    ),
    signedAgreement: false,
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
              field: 'linode_id',
              reason: 'You must select a Linode to clone from',
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
              field: 'stackscript_id',
              reason: 'You must select a StackScript.',
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
              field: 'stackscript_id',
              reason: 'You must select a Marketplace App.',
            },
          ],
        }),
        () => scrollErrorIntoView()
      );
    }

    const request =
      createType === 'fromLinode'
        ? () =>
            this.props.linodeActions.cloneLinode({
              sourceLinodeId: linodeID!,
              ...payload,
            })
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
            mutationFn: signAgreement,
            mutationKey: accountAgreementsQueryKey,
            onError: reportAgreementSigningError,
            variables: { eu_model: true, privacy_policy: true },
            ...simpleMutationHandlers(
              accountAgreementsQueryKey,
              this.props.queryClient
            ),
          });
        }

        /** Analytics creation event */
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

  toggleBackupsEnabled = () =>
    this.setState({ backupsEnabled: !this.state.backupsEnabled });

  togglePrivateIPEnabled = () =>
    this.setState({ privateIPEnabled: !this.state.privateIPEnabled });

  updateCustomLabel = (customLabel: string) => {
    this.setState({ customLabel });
  };
}

interface CreateType {
  createType: CreateTypes;
}

const mapStateToProps: MapState<CreateType, CombinedProps> = (state) => ({
  createType: state.createLinode.type,
});

const connected = connect(mapStateToProps);

export default recompose<CombinedProps, {}>(
  withImages,
  withLinodes,
  withRegions,
  withTypes,
  connected,
  withSnackbar,
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
