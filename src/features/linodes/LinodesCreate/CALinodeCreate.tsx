import { parse } from 'querystring';
import { compose, filter, map, pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { StickyContainer } from 'react-sticky';
import { compose as composeComponent } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import AppBar from 'src/components/core/AppBar';
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import { ExtendedRegion } from 'src/components/SelectRegionPanel';
import { dcDisplayNames } from 'src/constants';
import regionsContainer from 'src/containers/regions.container';
import withImages from 'src/containers/withImages.container';
import withLinodes from 'src/containers/withLinodes.container';
import { typeLabelDetails } from 'src/features/linodes/presentation';
import {
  hasGrant,
  isRestrictedUser
} from 'src/features/Profile/permissionsHelpers';
import { ApplicationState } from 'src/store';
import { MapState } from 'src/store/types';
import { ExtendedType } from './SelectPlanPanel';

export type TypeInfo =
  | {
      title: string;
      details: string;
      monthly: number;
      backupsMonthly: number | null;
    }
  | undefined;

type CombinedProps = WithImagesProps &
  WithLinodesProps &
  WithTypesProps &
  WithRegions &
  StateProps &
  RouteComponentProps<{}>;

interface State {
  selectedTab: number;
}

interface Tab {
  title: string;
  render: () => JSX.Element;
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
        return <React.Fragment />;
      }
    },
    {
      title: 'One-Click',
      render: () => {
        return <React.Fragment />;
      }
    },
    {
      title: 'My Images',
      render: () => {
        return <React.Fragment />;
      }
    }
  ];

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const { selectedTab } = this.state;

    const { regionsLoading, imagesLoading } = this.props;

    if (regionsLoading || imagesLoading) {
      return <CircleProgress />;
    }

    const tabRender = this.tabs[selectedTab].render;

    return (
      <StickyContainer>
        <DocumentTitleSegment segment="Create a Linode" />
        <Grid container>
          <Grid item className={`mlMain`}>
            <Typography role="header" variant="h1" data-qa-create-linode-header>
              Create New Linode
            </Typography>
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
                  <Tab
                    key={idx}
                    label={tab.title}
                    data-qa-create-from={tab.title}
                  />
                ))}
              </Tabs>
            </AppBar>
          </Grid>
          {tabRender()}
        </Grid>
      </StickyContainer>
    );
  }
}

interface WithTypesProps {
  typesData: ExtendedType[];
}

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

interface StateProps {
  accountBackupsEnabled: boolean;
  userCannotCreateLinode: boolean;
}

const mapStateToProps: MapState<StateProps, CombinedProps> = state => ({
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

interface WithImagesProps {
  imagesData: Linode.Image[];
  imagesLoading: boolean;
  imagesError?: string;
}

interface WithLinodesProps {
  linodesData: Linode.Linode[];
  linodesLoading: boolean;
  linodesError?: Linode.ApiFieldError[];
}

interface WithRegions {
  regionsData: ExtendedRegion[];
  regionsLoading: boolean;
  regionsError: Linode.ApiFieldError[];
}

const withRegions = regionsContainer(({ data, loading, error }) => ({
  regionsData: data.map(r => ({ ...r, display: dcDisplayNames[r.id] })),
  regionsLoading: loading,
  regionsError: error
}));

export default composeComponent<CombinedProps, {}>(
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
  withRouter,
  connected
)(LinodeCreate);
