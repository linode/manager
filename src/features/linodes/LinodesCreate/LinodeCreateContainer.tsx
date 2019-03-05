import { InjectedNotistackProps, withSnackbar } from 'notistack';
import { compose, filter, map, pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { StickyContainer } from 'react-sticky';
import { compose as recompose } from 'recompose';

import regionsContainer from 'src/containers/regions.container';
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
import userSSHKeyHoc, {
  State as userSSHKeyProps
} from 'src/features/linodes/userSSHKeyHoc';
import {
  hasGrant,
  isRestrictedUser
} from 'src/features/Profile/permissionsHelpers';
import CALinodeCreate from './CALinodeCreate';
import { ExtendedType } from './SelectPlanPanel';

import {
  HandleSubmit,
  Info,
  ReduxStateProps,
  TypeInfo,
  WithLinodesImagesTypesAndRegions
} from './types';

import { resetEventsPolling } from 'src/events';
import { cloneLinode } from 'src/services/linodes';

import { ApplicationState } from 'src/store';
import { upsertLinode } from 'src/store/linodes/linodes.actions';
import { MapState } from 'src/store/types';

import { allocatePrivateIP } from 'src/utilities/allocateIPAddress';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

interface State {
  selectedImageID?: string;
  selectedRegionID?: string;
  selectedTypeID?: string;
  selectedLinodeID?: number;
  selectedBackupID?: number;
  availableUserDefinedFields?: Linode.StackScript.UserDefinedField[];
  availableStackScriptImages?: Linode.Image[];
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
}

type CombinedProps = InjectedNotistackProps &
  CreateType &
  ReduxStateProps &
  LinodeActionsProps &
  WithLinodesImagesTypesAndRegions &
  userSSHKeyProps &
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
  selectedRegionID: undefined,
  selectedTypeID: undefined,
  tags: [],
  formIsSubmitting: false
};

const getRegionIDFromLinodeID = (
  linodes: Linode.Linode[],
  id: number
): string | undefined => {
  const thisLinode = linodes.find(linode => linode.id === id);
  return thisLinode ? thisLinode.region : undefined;
};

class LinodeCreateContainer extends React.PureComponent<CombinedProps, State> {
  state: State = defaultState;

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

      const selectedRegionID = getRegionIDFromLinodeID(
        this.props.linodesData,
        id
      );
      this.setState({
        selectedLinodeID: id,
        selectedDiskSize: diskSize,
        selectedTypeID: undefined,
        selectedRegionID
      });
    }
  };

  setStackScript = (
    id: number,
    label: string,
    username: string,
    userDefinedFields: Linode.StackScript.UserDefinedField[],
    images: Linode.Image[],
    defaultData?: any
  ) =>
    this.setState({
      selectedStackScriptID: id,
      selectedStackScriptLabel: label,
      selectedStackScriptUsername: username,
      availableUserDefinedFields: userDefinedFields,
      availableStackScriptImages: images,
      udfs: defaultData,
      /** reset image because stackscript might not be compatible with selected one */
      selectedImageID: undefined
    });

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
    const { selectedImageID, selectedRegionID } = this.state;

    /* tslint:disable-next-line  */
    let arg1,
      arg2,
      arg3 = '';

    if (selectedImageID) {
      const selectedImage = imagesData.find(img => img.id === selectedImageID);
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
      const selectedRegion = regionsData.find(
        region => region.id === selectedRegionID
      );

      arg2 = selectedRegion ? selectedRegion.id : '';
    }

    arg3 = this.props.createType;

    return getLabel(arg1, arg2, arg3);
  };

  submitForm: HandleSubmit = (type, payload, linodeID?: number) => {
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

    if (createType === 'fromStackScript' && !this.state.selectedStackScriptID) {
      return this.setState(
        () => ({
          errors: [
            {
              reason: 'You must select a StackScript to create from',
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

        /** show toast */
        this.props.enqueueSnackbar(
          `Your Linode ${response.label} is being created.`,
          {
            variant: 'success'
          }
        );

        /**
         * allocate private IP if we have one
         *
         * @todo we need to update redux state here as well but it's not
         * crucial now because the networking tab already makes a request to
         * /ips on componentDidMount
         */
        if (payload.private_ip) {
          allocatePrivateIP(response.id);
        }

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
    const typeInfo = this.reshapeTypeInfo(
      this.props.typesData.find(type => type.id === selectedTypeID)
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
    const selectedRegion = this.props.regionsData.find(
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

    const selectedImage = this.props.imagesData.find(
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
    return (
      <StickyContainer>
        <DocumentTitleSegment segment="Create a Linode" />
        <Grid container>
          <Grid item className={`mlMain`}>
            <Typography role="header" variant="h1" data-qa-create-linode-header>
              Create New Linode
            </Typography>
            <CALinodeCreate
              regionDisplayInfo={this.getRegionInfo()}
              imageDisplayInfo={this.getImageInfo()}
              typeDisplayInfo={this.getTypeInfo()}
              backupsMonthlyPrice={this.getBackupsMonthlyPrice()}
              regionsData={this.props.regionsData}
              typesData={this.props.typesData}
              regionsError={this.props.regionsError}
              regionsLoading={this.props.regionsLoading}
              imagesData={this.props.imagesData}
              imagesError={this.props.imagesError}
              imagesLoading={this.props.imagesLoading}
              linodesData={this.props.linodesData}
              linodesError={this.props.linodesError}
              linodesLoading={this.props.linodesLoading}
              accountBackupsEnabled={this.props.accountBackupsEnabled}
              userCannotCreateLinode={this.props.userCannotCreateLinode}
              selectedRegionID={this.state.selectedRegionID}
              updateRegionID={this.setRegionID}
              selectedImageID={this.state.selectedImageID}
              updateImageID={this.setImageID}
              selectedTypeID={this.state.selectedTypeID}
              updateTypeID={this.setTypeID}
              selectedLinodeID={this.state.selectedLinodeID}
              updateLinodeID={this.setLinodeID}
              selectedDiskSize={this.state.selectedDiskSize}
              updateDiskSize={this.setDiskSize}
              selectedUDFs={this.state.udfs}
              handleSelectUDFs={this.setUDFs}
              availableUserDefinedFields={this.state.availableUserDefinedFields}
              availableStackScriptImages={this.state.availableStackScriptImages}
              selectedStackScriptID={this.state.selectedStackScriptID}
              selectedStackScriptLabel={this.state.selectedStackScriptLabel}
              selectedStackScriptUsername={
                this.state.selectedStackScriptUsername
              }
              updateStackScript={this.setStackScript}
              label={this.generateLabel()}
              updateLabel={this.props.updateCustomLabel}
              password={this.state.password}
              updatePassword={this.setPassword}
              backupsEnabled={this.state.backupsEnabled}
              toggleBackupsEnabled={this.toggleBackupsEnabled}
              privateIPEnabled={this.state.privateIPEnabled}
              togglePrivateIPEnabled={this.togglePrivateIPEnabled}
              tags={this.state.tags}
              updateTags={this.setTags}
              errors={this.state.errors}
              formIsSubmitting={this.state.formIsSubmitting}
              history={this.props.history}
              handleSubmitForm={this.submitForm}
              resetCreationState={this.clearCreationState}
              userSSHKeys={this.props.userSSHKeys}
              resetSSHKeys={this.props.resetSSHKeys}
              selectedBackupID={this.state.selectedBackupID}
              setBackupID={this.setBackupID}
            />
          </Grid>
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

const withTypes = connect((state: ApplicationState, ownProps) => ({
  typesData: compose(
    map<Linode.LinodeType, ExtendedType>(type => {
      const {
        label,
        memory,
        vcpus,
        disk,
        price: { monthly, hourly }
      } = type;
      return {
        ...type,
        heading: label,
        subHeadings: [
          `$${monthly}/mo ($${hourly}/hr)`,
          typeLabelDetails(memory, disk, vcpus)
        ]
      };
    }),
    /* filter out all the deprecated types because we don't to display them */
    filter<any>((eachType: Linode.LinodeType) => {
      if (!eachType.successor) {
        return true;
      }
      return eachType.successor === null;
    })
  )(state.__resources.types.entities)
}));

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
