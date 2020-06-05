import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import AccessPanel from 'src/components/AccessPanel';
import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import LabelAndTagsPanel from 'src/components/LabelAndTagsPanel';
import { WithImages } from 'src/containers/withImages.container';
import {
  getCommunityStackscripts,
  getMineAndAccountStackScripts
} from 'src/features/StackScripts/stackScriptUtils';
import {
  CreateTypes,
  handleChangeCreateType
} from 'src/store/linodeCreate/linodeCreate.actions';
import { getInitialType } from 'src/store/linodeCreate/linodeCreate.reducer';
import { getErrorMap } from 'src/utilities/errorUtils';
import { getParamsFromUrl } from 'src/utilities/queryParams';
import { safeGetTabRender } from 'src/utilities/safeGetTabRender';
import AddonsPanel from './AddonsPanel';
import FromAppsContent from './TabbedContent/FromAppsContent';
import FromBackupsContent from './TabbedContent/FromBackupsContent';
import FromImageContent from './TabbedContent/FromImageContent';
import FromLinodeContent from './TabbedContent/FromLinodeContent';
import FromStackScriptContent from './TabbedContent/FromStackScriptContent';
import {
  AllFormStateAndHandlers,
  AppsData,
  ReduxStatePropsAndSSHKeys,
  WithDisplayData,
  WithLinodesProps,
  WithRegionsProps,
  WithTypesProps
} from './types';
import TabbedPanel, { Tab } from 'src/components/TabbedPanel';

interface Props {
  history: any;
  createType: CreateTypes;
}

const errorMap = [
  'backup_id',
  'linode_id',
  'stackscript_id',
  'region',
  'type',
  'root_pass',
  'label',
  'image'
];

type CombinedProps = Props &
  WithImages &
  WithLinodesProps &
  WithRegionsProps &
  WithTypesProps &
  WithDisplayData &
  AppsData &
  ReduxStatePropsAndSSHKeys &
  AllFormStateAndHandlers;

interface State {
  selectedTab: number;
}

export class LinodeCreate extends React.PureComponent<
  CombinedProps & DispatchProps,
  State
> {
  constructor(props: CombinedProps & DispatchProps) {
    super(props);

    /** get the query params as an object, excluding the "?" */
    const queryParams = getParamsFromUrl(location.search);

    /** will be -1 if the query param is not found */
    const preSelectedTab = this.tabs.findIndex((eachTab, index) => {
      return eachTab.title === queryParams.type;
    });

    // If there is no specified "type" in the query params, update the Redux state
    // so that the correct request is made when the form is submitted.
    // if (!queryParams.type) {
    //   this.props.setTab(this.tabs[0].type);
    // }

    this.state = {
      selectedTab: preSelectedTab !== -1 ? preSelectedTab : 0
    };
  }

  mounted: boolean = false;

  componentDidMount() {
    this.mounted = true;
    this.props.setTab(getInitialType());
  }

  handleTabChange = (
    event: React.ChangeEvent<HTMLDivElement>,
    value: number
  ) => {
    this.props.resetCreationState();

    /** set the tab in redux state */
    // this.props.setTab(this.tabs[value].type);

    this.props.history.push({
      search: `?type=${event.target.textContent}`
    });
    this.setState({
      selectedTab: value
    });
  };

  tabs: Tab[] = [
    {
      title: 'Distributions',
      // name: 'distro-create',
      // type: 'fromImage',
      render: () => {
        /** ...rest being all the form state props and display data */
        const {
          history,
          handleSelectUDFs,
          selectedUDFs,
          updateStackScript,
          availableStackScriptImages,
          availableUserDefinedFields,
          selectedStackScriptID,
          selectedDiskSize,
          selectedStackScriptUsername,
          selectedStackScriptLabel,
          selectedLinodeID,
          appInstances,
          appInstancesError,
          appInstancesLoading,
          linodesData,
          linodesError,
          linodesLoading,
          typesData,
          typesError,
          typesLoading,
          regionsData,
          regionsError,
          regionsLoading,
          imagesData,
          imagesError,
          imagesLoading,
          ...rest
        } = this.props;
        return (
          <React.Fragment>
            <FromImageContent
              variant="public"
              imagePanelTitle="Choose a Distribution"
              showGeneralError={true}
              imagesData={imagesData!}
              regionsData={regionsData!}
              typesData={typesData!}
              {...rest}
            />
          </React.Fragment>
        );
      }
    },
    {
      title: 'Marketplace',
      // type: 'fromApp',
      // name: 'parent-one-click',
      render: () => {
        return (
          // <SubTabs
          //   history={this.props.history}
          //   name="parent-one-click"
          //   reset={this.props.resetCreationState}
          //   tabs={this.oneClickTabs()}
          //   handleClick={this.props.setTab}
          //   errors={this.props.errors}
          // />
          <div>test</div>
        );
      }
    },
    {
      title: 'StackScripts',
      render: () => {
        return <div>test</div>;
      }
    },
    {
      title: 'My Images',
      // type: 'fromImage',
      // name: 'images-create',
      render: () => {
        return (
          // <SubTabs
          //   reset={this.props.resetCreationState}
          //   name="images-create"
          //   history={this.props.history}
          //   tabs={this.myImagesTabs()}
          //   handleClick={this.props.setTab}
          //   errors={this.props.errors}
          // />
          <div>test</div>
        );
      }
    },
    {
      title: 'Backups',
      render: () => {
        return <div>test</div>;
      }
    },
    {
      title: 'Clones',
      render: () => {
        return <div>test</div>;
      }
    }
  ];

  myImagesTabs = (): Tab[] => [
    {
      title: 'Images',
      // type: 'fromImage',
      // name: 'image-private-create',
      render: () => {
        const {
          history,
          linodesData,
          linodesError,
          linodesLoading,
          typesData,
          typesError,
          typesLoading,
          regionsData,
          regionsError,
          regionsLoading,
          imagesData,
          imagesError,
          imagesLoading,
          handleSelectUDFs,
          selectedUDFs,
          updateStackScript,
          availableStackScriptImages,
          availableUserDefinedFields,
          selectedStackScriptID,
          selectedDiskSize,
          selectedStackScriptUsername,
          selectedStackScriptLabel,
          selectedLinodeID,
          appInstances,
          appInstancesError,
          appInstancesLoading,
          ...rest
        } = this.props;

        return (
          <FromImageContent
            variant={'private'}
            imagePanelTitle="Choose an Image"
            imagesData={imagesData}
            regionsData={regionsData!}
            typesData={typesData!}
            {...rest}
          />
        );
      }
    },
    {
      title: 'Backups',
      // type: 'fromBackup',
      // name: 'backup-create',
      render: () => {
        const {
          history,
          handleSelectUDFs,
          selectedUDFs,
          updateStackScript,
          availableStackScriptImages,
          availableUserDefinedFields,
          selectedStackScriptID,
          selectedStackScriptUsername,
          selectedStackScriptLabel,
          linodesData,
          linodesError,
          linodesLoading,
          typesData,
          typesError,
          typesLoading,
          regionsData,
          regionsError,
          regionsLoading,
          imagesData,
          imagesError,
          imagesLoading,
          ...rest
        } = this.props;
        return (
          <FromBackupsContent
            imagesData={imagesData!}
            regionsData={regionsData!}
            typesData={typesData!}
            linodesData={linodesData!}
            {...rest}
          />
        );
      }
    },
    {
      title: 'Clone Linode',
      // type: 'fromLinode',
      // name: 'clone-create',
      render: () => {
        /**
         * rest being just the props that FromLinodeContent needs
         * AKA CloneFormStateHandlers, WithLinodesImagesTypesAndRegions,
         * and WithDisplayData
         */
        const {
          handleSelectUDFs,
          selectedUDFs,
          selectedStackScriptID,
          updateStackScript,
          appInstances,
          appInstancesError,
          appInstancesLoading,
          linodesData,
          linodesError,
          linodesLoading,
          typesData,
          typesError,
          typesLoading,
          regionsData,
          regionsError,
          regionsLoading,
          imagesData,
          imagesError,
          imagesLoading,
          ...rest
        } = this.props;
        return (
          <FromLinodeContent
            imagesData={imagesData!}
            regionsData={regionsData!}
            typesData={typesData!}
            linodesData={linodesData!}
            {...rest}
          />
        );
      }
    },
    {
      title: 'Account StackScripts',
      // type: 'fromStackScript',
      // name: 'account-stackscript-create',
      render: () => {
        const {
          accountBackupsEnabled,
          userCannotCreateLinode,
          selectedLinodeID,
          updateLinodeID,
          selectedBackupID,
          setBackupID,
          appInstances,
          appInstancesError,
          appInstancesLoading,
          linodesData,
          linodesError,
          linodesLoading,
          typesData,
          typesError,
          typesLoading,
          regionsData,
          regionsError,
          regionsLoading,
          imagesData,
          imagesError,
          imagesLoading,
          ...rest
        } = this.props;
        return (
          <FromStackScriptContent
            category="account"
            accountBackupsEnabled={this.props.accountBackupsEnabled}
            userCannotCreateLinode={this.props.userCannotCreateLinode}
            request={getMineAndAccountStackScripts}
            header={'Select a StackScript'}
            imagesData={imagesData!}
            regionsData={regionsData!}
            typesData={typesData!}
            {...rest}
          />
        );
      }
    }
  ];

  oneClickTabs = (): Tab[] => [
    {
      title: '',
      // title: (
      //   <div style={{ display: 'flex', alignItems: 'center' }}>Marketplace</div>
      // ),
      // type: 'fromApp',
      // name: 'one-click-apps-create',
      render: () => {
        const {
          setTab,
          linodesData,
          linodesError,
          linodesLoading,
          typesData,
          typesError,
          typesLoading,
          regionsData,
          regionsError,
          regionsLoading,
          imagesData,
          imagesError,
          imagesLoading,
          ...rest
        } = this.props;
        return (
          <FromAppsContent
            imagesData={imagesData!}
            regionsData={regionsData!}
            typesData={typesData!}
            {...rest}
          />
        );
      }
    },
    {
      title: 'Community StackScripts',
      // type: 'fromStackScript',
      // name: 'community-stackscript-create',
      render: () => {
        const {
          accountBackupsEnabled,
          userCannotCreateLinode,
          selectedLinodeID,
          updateLinodeID,
          selectedBackupID,
          setBackupID,
          linodesData,
          linodesError,
          linodesLoading,
          typesData,
          typesError,
          typesLoading,
          regionsData,
          regionsError,
          regionsLoading,
          imagesData,
          imagesError,
          imagesLoading,
          ...rest
        } = this.props;
        return (
          <FromStackScriptContent
            category="community"
            accountBackupsEnabled={this.props.accountBackupsEnabled}
            userCannotCreateLinode={this.props.userCannotCreateLinode}
            request={getCommunityStackscripts}
            header={'Select a StackScript'}
            imagesData={imagesData!}
            regionsData={regionsData!}
            typesData={typesData!}
            {...rest}
          />
        );
      }
    }
  ];

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const { selectedTab } = this.state;

    const {
      regionsLoading,
      imagesLoading,
      linodesLoading,
      imagesError,
      regionsError,
      linodesError,
      typesError,
      typesLoading,
      label,
      updateLabel,
      tags,
      updateTags,
      errors,
      sshError,
      userSSHKeys,
      requestKeys,
      backupsMonthlyPrice,
      userCannotCreateLinode
    } = this.props;

    const hasErrorFor = getErrorMap(errorMap, errors);

    if (regionsLoading || imagesLoading || linodesLoading || typesLoading) {
      return <CircleProgress />;
    }

    if (regionsError || imagesError.read || linodesError || typesError) {
      return (
        <ErrorState errorText="There was an issue loading Linode creation options." />
      );
    }

    if (
      !this.props.regionsData ||
      !this.props.imagesData ||
      !this.props.linodesData ||
      !this.props.typesData
    ) {
      return null;
    }
    // if this bombs the app shouldn't crash
    const tabRender = safeGetTabRender(this.tabs, selectedTab);

    return (
      <React.Fragment>
        <Grid item className={`mlMain py0`}>
          {/* <AppBar position="static" color="default" role="tablist">
            <Tabs
              value={selectedTab}
              onChange={this.handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="on"
            >
              {this.tabs.map((tab, idx) => (
                <MUITab
                  key={idx}
                  label={tab.title}
                  data-qa-create-from={tab.title}
                  role="tab"
                  aria-controls={`tabpanel-${tab.name}`}
                  id={`tab-${tab.name}`}
                />
              ))}
            </Tabs>
          </AppBar> */}
          <TabbedPanel header={''} tabs={this.tabs} />
          <LabelAndTagsPanel
            labelFieldProps={{
              label: 'Linode Label',
              value: label || '',
              onChange: updateLabel,
              errorText: hasErrorFor.label,
              disabled: userCannotCreateLinode
            }}
            tagsInputProps={{
              value: tags || [],
              onChange: updateTags,
              tagError: hasErrorFor.tags,
              disabled: userCannotCreateLinode
            }}
            updateFor={[tags, label, errors]}
          />
          <AccessPanel
            disabled={!this.props.selectedImageID}
            disabledReason={
              !this.props.selectedImageID
                ? 'You must select an image to set a root password'
                : ''
            }
            error={hasErrorFor.root_pass}
            sshKeyError={sshError}
            password={this.props.password}
            handleChange={this.props.updatePassword}
            updateFor={[
              this.props.password,
              errors,
              sshError,
              userSSHKeys,
              this.props.selectedImageID
            ]}
            users={userSSHKeys}
            requestKeys={requestKeys}
          />
          <AddonsPanel
            data-qa-addons-panel
            backups={this.props.backupsEnabled}
            accountBackups={this.props.accountBackupsEnabled}
            backupsMonthly={backupsMonthlyPrice}
            privateIP={this.props.privateIPEnabled}
            changeBackups={this.props.toggleBackupsEnabled}
            changePrivateIP={this.props.togglePrivateIPEnabled}
            updateFor={[
              this.props.privateIPEnabled,
              this.props.backupsEnabled,
              this.props.selectedTypeID
            ]}
            disabled={userCannotCreateLinode}
            hidePrivateIP={this.props.createType === 'fromLinode'}
          />
        </Grid>
        <Grid
          item
          className={
            'mlSidebar ' +
            (variant === 'private'
              ? classes.sidebarPrivate
              : classes.sidebarPublic)
          }
        >
          <CheckoutBar
            data-qa-checkout-bar
            heading="Linode Summary"
            calculatedPrice={calculatedPrice}
            isMakingRequest={this.props.formIsSubmitting}
            disabled={this.props.formIsSubmitting || userCannotCreateLinode}
            onDeploy={this.createLinode}
          >
            <DisplaySectionList displaySections={displaySections} />
          </CheckoutBar>
        </Grid>
        {/* {tabRender()} */}
      </React.Fragment>
    );
  }
}

interface DispatchProps {
  setTab: (value: CreateTypes) => void;
}

const mapDispatchToProps: MapDispatchToProps<
  DispatchProps,
  CombinedProps
> = dispatch => ({
  setTab: value => dispatch(handleChangeCreateType(value))
});

const connected = connect(undefined, mapDispatchToProps);

export default connected(LinodeCreate);
