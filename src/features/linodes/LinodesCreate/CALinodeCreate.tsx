import { parse } from 'querystring';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import CircleProgress from 'src/components/CircleProgress';
import AppBar from 'src/components/core/AppBar';
import MUITab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import Grid from 'src/components/Grid';
import { getStackScriptsByUser } from 'src/features/StackScripts/stackScriptUtils';
import {
  CreateTypes,
  handleChangeCreateType
} from 'src/store/linodeCreate/linodeCreate.actions';
import SubTabs, { Tab } from './CALinodeCreateSubTabs';
import FromImageContent from './TabbedContent/FromImageContent';
import FromLinodeContent from './TabbedContent/FromLinodeContent';
import FromStackScriptContent from './TabbedContent/FromStackScriptContent';

import {
  AllFormStateAndHandlers,
  WithDisplayData,
  WithLinodesImagesTypesAndRegions
} from './types';

interface Props {
  history: any;
}

type CombinedProps = Props &
  WithLinodesImagesTypesAndRegions &
  WithDisplayData &
  DispatchProps &
  AllFormStateAndHandlers;

interface State {
  selectedTab: number;
}

export class LinodeCreate extends React.PureComponent<CombinedProps, State> {
  constructor(props: CombinedProps) {
    super(props);

    /** get the query params as an object, excluding the "?" */
    const queryParams = parse(location.search.replace('?', ''));

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

    this.props.setTab(event.target.textContent as CreateTypes);
    this.props.history.push({
      search: `?type=${event.target.textContent}`
    });
    this.setState({
      selectedTab: value
    });
  };

  tabs: Tab[] = [
    {
      title: 'Distrubutions',
      render: () => {
        /** ...rest being all the formstate props and display data */
        const {
          history,
          linodesData,
          linodesError,
          linodesLoading,
          ...rest
        } = this.props;
        return (
          <FromImageContent
            publicOnly
            imagePanelTitle="Choose a Distribution"
            {...rest}
          />
        );
      }
    },
    {
      title: 'One-Click',
      render: () => {
        return (
          <SubTabs
            history={this.props.history}
            reset={this.props.resetCreationState}
            type="oneClick"
            onClick={this.props.setTab}
          />
        );
      }
    },
    {
      title: 'My Images',
      render: () => {
        return (
          <SubTabs
            reset={this.props.resetCreationState}
            history={this.props.history}
            type="myImages"
            tabs={this.myImagesTabs()}
            onClick={this.props.setTab}
          />
        );
      }
    }
  ];

  myImagesTabs = (): Tab[] => [
    {
      title: 'Backups and My Images',
      render: () => {
        return <React.Fragment />;
      }
    },
    {
      title: 'Clone from Existing Linode',
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
          linodesLoading,
          linodesError,
          regionsLoading,
          regionsError,
          ...rest
        } = this.props;
        return (
          <FromLinodeContent
            notice={{
              level: 'warning',
              text: `This newly created Linode will be created with
                      the same password and SSH Keys (if any) as the original Linode.`
            }}
            {...rest}
          />
        );
      }
    },
    {
      title: 'My StackScripts',
      render: () => {
        const {
          accountBackupsEnabled,
          userCannotCreateLinode,
          ...rest
        } = this.props;
        return (
          <FromStackScriptContent
            accountBackupsEnabled={this.props.accountBackupsEnabled}
            userCannotCreateLinode={this.props.userCannotCreateLinode}
            request={getStackScriptsByUser}
            header={'Select a StackScript'}
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

    const { regionsLoading, imagesLoading, linodesLoading } = this.props;

    if (regionsLoading || imagesLoading || linodesLoading) {
      return <CircleProgress />;
    }

    if (
      !this.props.regionsData ||
      !this.props.imagesData ||
      !this.props.linodesData
    ) {
      return null;
    }

    /** @todo handle for errors loading anything */

    const tabRender = this.tabs[selectedTab].render;

    return (
      <React.Fragment>
        <Grid item>
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
                  data-qa-create-from={tab.title}
                />
              ))}
            </Tabs>
          </AppBar>
        </Grid>
        <Grid item>{tabRender()}</Grid>
      </React.Fragment>
    );
  }
}

interface DispatchProps {
  setTab: (newType: CreateTypes) => void;
}

const mapDispatchToProps: MapDispatchToProps<
  DispatchProps,
  Props
> = dispatch => ({
  setTab: newType => dispatch(handleChangeCreateType(newType))
});

const connected = connect(
  undefined,
  mapDispatchToProps
);

export default connected(LinodeCreate);
