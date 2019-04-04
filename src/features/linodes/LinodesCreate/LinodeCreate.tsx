import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import CircleProgress from 'src/components/CircleProgress';
import AppBar from 'src/components/core/AppBar';
import Chip from 'src/components/core/Chip';
import MUITab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import {
  getCommunityStackscripts,
  getMineAndAccountStackScripts
} from 'src/features/StackScripts/stackScriptUtils';
import { getParamsFromUrl } from 'src/utilities/queryParams';
import SubTabs, { Tab } from './LinodeCreateSubTabs';
import FromAppsContent from './TabbedContent/FromAppsContent';
import FromBackupsContent from './TabbedContent/FromBackupsContent';
import FromImageContent from './TabbedContent/FromImageContent';
import FromLinodeContent from './TabbedContent/FromLinodeContent';
import FromStackScriptContent from './TabbedContent/FromStackScriptContent';

import {
  CreateTypes,
  handleChangeCreateType
} from 'src/store/linodeCreate/linodeCreate.actions';

import {
  AllFormStateAndHandlers,
  AppsData,
  ReduxStatePropsAndSSHKeys,
  WithDisplayData,
  WithImagesProps,
  WithLinodesProps,
  WithRegionsProps,
  WithTypesProps
} from './types';

interface Props {
  history: any;
}

type CombinedProps = Props &
  WithImagesProps &
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

    this.state = {
      selectedTab: preSelectedTab !== -1 ? preSelectedTab : 0
    };
  }

  mounted: boolean = false;

  componentDidMount() {
    this.mounted = true;
  }

  handleTabChange = (
    event: React.ChangeEvent<HTMLDivElement>,
    value: number
  ) => {
    this.props.resetCreationState();

    /** set the tab in redux state */
    this.props.setTab(this.tabs[value].type);

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
      type: 'fromImage',
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
          <FromImageContent
            variant="public"
            imagePanelTitle="Choose a Distribution"
            imagesData={imagesData!}
            regionsData={regionsData!}
            typesData={typesData!}
            {...rest}
          />
        );
      }
    },
    {
      title: 'One-Click',
      type: 'fromApp',
      render: () => {
        return (
          <SubTabs
            history={this.props.history}
            reset={this.props.resetCreationState}
            tabs={this.oneClickTabs()}
            handleClick={this.props.setTab}
            errors={this.props.errors}
          />
        );
      }
    },
    {
      title: 'My Images',
      type: 'fromImage',
      render: () => {
        return (
          <SubTabs
            reset={this.props.resetCreationState}
            history={this.props.history}
            tabs={this.myImagesTabs()}
            handleClick={this.props.setTab}
            errors={this.props.errors}
          />
        );
      }
    }
  ];

  myImagesTabs = (): Tab[] => [
    {
      title: 'Images',
      type: 'fromImage',
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
            imagesData={imagesData!}
            regionsData={regionsData!}
            typesData={typesData!}
            {...rest}
          />
        );
      }
    },
    {
      title: 'Backups',
      type: 'fromBackup',
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
      type: 'fromLinode',
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
      title: 'My StackScripts',
      type: 'fromStackScript',
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
      title: (
        <div>
          One-Click Apps <Chip label="beta" style={{ cursor: 'pointer' }} />
        </div>
      ),
      type: 'fromApp',
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
      type: 'fromStackScript',
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
      typesLoading
    } = this.props;

    if (regionsLoading || imagesLoading || linodesLoading || typesLoading) {
      return <CircleProgress />;
    }

    if (regionsError || imagesError || linodesError || typesError) {
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

    const tabRender = this.tabs[selectedTab].render;

    return (
      <React.Fragment>
        <Grid item className={`mlMain py0`}>
          <AppBar position="static" color="default">
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
                  data-qa-create-from={tab.type}
                />
              ))}
            </Tabs>
          </AppBar>
        </Grid>
        {tabRender()}
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

const connected = connect(
  undefined,
  mapDispatchToProps
);

export default connected(LinodeCreate);
