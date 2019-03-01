import { InjectedNotistackProps, withSnackbar } from 'notistack';
import {
  compose,
  filter,
  find,
  lensPath,
  map,
  pathOr,
  prop,
  propEq,
  set
} from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { StickyContainer } from 'react-sticky';
import { compose as recompose } from 'recompose';

import {
  LinodeActionsProps,
  withLinodeActions
} from 'src/store/linodes/linode.containers';

import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import { Tag } from 'src/components/TagsInput';
// import withLoadingAndError,
// { Props as LoadingAndErrorProps } from 'src/components/withLoadingAndError';

import { dcDisplayNames } from 'src/constants';
import regionsContainer from 'src/containers/regions.container';
import withImages from 'src/containers/withImages.container';
import withLinodes from 'src/containers/withLinodes.container';
import {
  displayType,
  typeLabelDetails
} from 'src/features/linodes/presentation';
import {
  hasGrant,
  isRestrictedUser
} from 'src/features/Profile/permissionsHelpers';
import { ApplicationState } from 'src/store';
import { MapState } from 'src/store/types';
import { ExtendedType } from './SelectPlanPanel';

import CALinodeCreate from './CALinodeCreate';
import {
  ExtendedLinode,
  HandleSubmit,
  Info,
  ReduxStateProps,
  TypeInfo,
  WithLinodesImagesTypesAndRegions
} from './types';

import { resetEventsPolling } from 'src/events';
import { cloneLinode } from 'src/services/linodes';
import { allocatePrivateIP } from 'src/utilities/allocateIPAddress';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

interface State {
  selectedImageID?: string;
  selectedRegionID?: string;
  selectedTypeID?: string;
  selectedLinodeID?: number;
  selectedStackScriptID?: number;
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
  LinodeActionsProps &
  WithLinodesImagesTypesAndRegions &
  RouteComponentProps<{}>;

class LinodeCreateContainer extends React.PureComponent<CombinedProps, State> {
  state: State = {
    privateIPEnabled: false,
    backupsEnabled: false,
    label: '',
    password: '',
    selectedImageID: 'linode/debian9',
    formIsSubmitting: false
  };

  setImageID = (id: string) => {
    /** allows for de-selecting an image */
    if (id === this.state.selectedImageID) {
      return this.setState({ selectedImageID: undefined });
    }
    return this.setState({ selectedImageID: id });
  };

  setRegionID = (id: string) => this.setState({ selectedRegionID: id });

  setTypeID = (id: string) => this.setState({ selectedTypeID: id });

  setLinodeID = (id: number) => this.setState({ selectedLinodeID: id });

  setStackScriptID = (id: number) =>
    this.setState({ selectedStackScriptID: id });

  setDiskSize = (size: number) => this.setState({ selectedDiskSize: size });

  setLabel = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => this.setState({ label: event.target.value });

  setPassword = (password: string) => this.setState({ password });

  toggleBackupsEnabled = () =>
    this.setState({ backupsEnabled: !this.state.backupsEnabled });

  togglePrivateIPEnabled = () =>
    this.setState({ privateIPEnabled: !this.state.privateIPEnabled });

  setTags = (tags: Tag[]) => this.setState({ tags });

  setUDFs = (udfs: any[]) => this.setState({ udfs });

  submitForm: HandleSubmit = (type, payload, linodeID?: number) => {
    /**
     * run a certain linode action based on the type
     * if clone, run clone service request and upsert linode
     * if create, run create action
     */
    if (type === 'clone' && !linodeID) {
      return;
    }
    const request =
      type === 'create'
        ? () => this.props.linodeActions.createLinode(payload)
        : () => cloneLinode(linodeID!, payload);

    this.setState({ formIsSubmitting: true });

    return request()
      .then((response: Linode.Linode) => {
        this.setState({ formIsSubmitting: false });

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
         * @todo we need to update redux state here as well
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

  extendLinodes = (linodes: Linode.Linode[]): ExtendedLinode[] => {
    const images = this.props.imagesData || [];
    const types = this.props.typesData || [];
    return linodes.map(
      linode =>
        compose<
          Linode.Linode,
          Partial<ExtendedLinode>,
          Partial<ExtendedLinode>
        >(
          set(lensPath(['heading']), linode.label),
          set(
            lensPath(['subHeadings']),
            formatLinodeSubheading(
              displayType(linode.type, types),
              compose<Linode.Image[], Linode.Image, string>(
                prop('label'),
                find(propEq('id', linode.image))
              )(images)
            )
          )
        )(linode) as ExtendedLinode
    );
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
              // selectedDiskSize={this.state.selectedDiskSize}
              // updateDiskSize={this.setDiskSize}
              selectedUDFs={this.state.udfs}
              handleSelectUDFs={this.setUDFs}
              selectedStackScriptID={this.state.selectedStackScriptID}
              updateStackScriptID={this.setStackScriptID}
              label={this.state.label}
              updateLabel={this.setLabel}
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
            />
          </Grid>
        </Grid>
      </StickyContainer>
    );
  }
}

const mapStateToProps: MapState<ReduxStateProps, CombinedProps> = state => ({
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
    isRestrictedUser(state) && !hasGrant(state, 'add_linodes')
});

const connected = connect(mapStateToProps);

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

const formatLinodeSubheading = (typeInfo: string, imageInfo: string) => {
  const subheading = imageInfo ? `${typeInfo}, ${imageInfo}` : `${typeInfo}`;
  return [subheading];
};

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
  withSnackbar
)(LinodeCreateContainer);
