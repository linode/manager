import { parse } from 'querystring';
import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import AppBar from 'src/components/core/AppBar';
import MUITab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import Grid from 'src/components/Grid';
import SubTabs, { Tab } from './CALinodeCreateSubTabs';
import FromImageContent from './TabbedContent/FromImageContent';
// import FromLinodeContent from './TabbedContent/FromLinodeContent';
// import FromStackScriptContent from './TabbedContent/FromStackScriptContent';

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
  AllFormStateAndHandlers;

interface State {
  selectedTab: number;
}

export class LinodeCreate extends React.Component<CombinedProps, State> {
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
    this.props.history.push({
      search: `?type=${event.target.textContent}`
    });
    this.setState({
      selectedTab: value
    });
  };

  tabs: Tab[] = [
    {
      title: 'Distros',
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
        return <SubTabs history={this.props.history} type="oneClick" />;
      }
    },
    {
      title: 'My Images',
      render: () => {
        return (
          <SubTabs
            history={this.props.history}
            type="myImages"
            tabs={this.myImagesTabs}
          />
        );
      }
    }
  ];

  myImagesTabs: Tab[] = [
    {
      title: 'Backups and My Images',
      render: () => {
        return <React.Fragment />;
      }
    },
    {
      title: 'Clone From Existing Linode',
      render: () => {
        return (
          <React.Fragment />
          // <FromLinodeContent
          //   notice={{
          //     level: 'warning',
          //     text: `This newly created Linode will be created with
          //             the same password and SSH Keys (if any) as the original Linode.`
          //   }}
          //   getBackupsMonthlyPrice={this.props.getBackupsMonthlyPrice}
          //   regions={this.props.regionsData}
          //   types={this.props.typesData}
          //   linodes={this.props.linodesData}
          //   extendLinodes={this.props.extendLinodes}
          //   typeDisplayInfo ={this.props.getTypeInfo}
          //   getRegionInfo={this.props.getRegionInfo}
          //   accountBackups={this.props.accountBackupsEnabled}
          //   history={this.props.history}
          // />
        );
      }
    },
    {
      title: 'My StackScripts',
      render: () => {
        return (
          <React.Fragment />
          // <FromStackScriptContent
          //   getBackupsMonthlyPrice={this.props.getBackupsMonthlyPrice}
          //   regionsData={this.props.regionsData}
          //   getImageInfo={this.props.getImageInfo}
          //   imagesData={this.props.imagesData}
          //   typesData={this.props.typesData}
          //   getTypeInfo={this.props.getTypeInfo}
          //   getRegionInfo={this.props.getRegionInfo}
          //   history={this.props.history}
          //   accountBackups={this.props.accountBackupsEnabled}
          //   selectedStackScriptFromQuery={undefined}
          //   handleDisablePasswordField={this.props.handleDisablePasswordField}
          //   disabled={this.props.userCannotCreateLinode}
          //   request={getStackScriptsByUser}
          //   header={'Select a StackScript'}
          // />
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

export default LinodeCreate;
