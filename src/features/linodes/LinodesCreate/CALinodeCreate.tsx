import { parse } from 'querystring';
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
import { compose as composeComponent } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import AppBar from 'src/components/core/AppBar';
import MUITab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import { ExtendedRegion } from 'src/components/SelectRegionPanel';
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
import { getStackScriptsByUser } from 'src/features/StackScripts/stackScriptUtils';
import { ApplicationState } from 'src/store';
import { MapState } from 'src/store/types';
// import { parseQueryParams } from 'src/utilities/queryParams';
import SubTabs, { Tab } from './CALinodeCreateSubTabs';
import { ExtendedType } from './SelectPlanPanel';
import FromImageContent from './TabbedContent/FromImageContent';
import FromLinodeContent from './TabbedContent/FromLinodeContent';
import FromStackScriptContent from './TabbedContent/FromStackScriptContent';
import { Info } from './util';

export interface ExtendedLinode extends Linode.Linode {
  heading: string;
  subHeadings: string[];
}

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

const formatLinodeSubheading = (typeInfo: string, imageInfo: string) => {
  const subheading = imageInfo ? `${typeInfo}, ${imageInfo}` : `${typeInfo}`;
  return [subheading];
};

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
        return (
          <FromImageContent
            publicOnly
            imagePanelTitle="Choose a Distribution"
            getBackupsMonthlyPrice={this.getBackupsMonthlyPrice}
            regions={this.props.regionsData}
            images={this.props.imagesData}
            types={this.props.typesData}
            getTypeInfo={this.getTypeInfo}
            getRegionInfo={this.getRegionInfo}
            history={this.props.history}
            accountBackups={this.props.accountBackupsEnabled}
            handleDisablePasswordField={this.handleDisablePasswordField}
            disabled={this.props.userCannotCreateLinode}
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
          <FromLinodeContent
            notice={{
              level: 'warning',
              text: `This newly created Linode will be created with
                      the same password and SSH Keys (if any) as the original Linode.`
            }}
            getBackupsMonthlyPrice={this.getBackupsMonthlyPrice}
            regions={this.props.regionsData}
            types={this.props.typesData}
            linodes={this.props.linodesData}
            extendLinodes={this.extendLinodes}
            getTypeInfo={this.getTypeInfo}
            getRegionInfo={this.getRegionInfo}
            accountBackups={this.props.accountBackupsEnabled}
            history={this.props.history}
          />
        );
      }
    },
    {
      title: 'My StackScripts',
      render: () => {
        return (
          <FromStackScriptContent
            getBackupsMonthlyPrice={this.getBackupsMonthlyPrice}
            regions={this.props.regionsData}
            images={this.props.imagesData}
            types={this.props.typesData}
            getTypeInfo={this.getTypeInfo}
            getRegionInfo={this.getRegionInfo}
            history={this.props.history}
            accountBackups={this.props.accountBackupsEnabled}
            selectedStackScriptFromQuery={undefined}
            handleDisablePasswordField={this.handleDisablePasswordField}
            disabled={this.props.userCannotCreateLinode}
            request={getStackScriptsByUser}
            header={'Select a StackScript'}
          />
        );
      }
    }
  ];

  componentWillUnmount() {
    this.mounted = false;
  }

  getBackupsMonthlyPrice = (selectedTypeID: string | null): number | null => {
    if (!selectedTypeID || !this.props.typesData) {
      return null;
    }
    const type = this.getTypeInfo(selectedTypeID);
    if (!type) {
      return null;
    }
    return type.backupsMonthly;
  };

  getImageInfo = (image: Linode.Image | undefined): Info => {
    return (
      image && {
        title: `${image.vendor || image.label}`,
        details: `${image.vendor ? image.label : ''}`
      }
    );
  };

  getTypeInfo = (selectedTypeID: string | null): TypeInfo => {
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

  reshapeTypeInfo = (type: ExtendedType | undefined): TypeInfo => {
    return (
      type && {
        title: type.label,
        details: `${typeLabelDetails(type.memory, type.disk, type.vcpus)}`,
        monthly: type.price.monthly,
        backupsMonthly: type.addons.backups.price.monthly
      }
    );
  };

  getRegionInfo = (selectedRegionID?: string | null): Info => {
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

  handleDisablePasswordField = (imageSelected: boolean) => {
    if (!imageSelected) {
      return {
        disabled: true,
        reason: 'You must first select an image to enter a root password'
      };
    }
    return;
  };

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
                  <MUITab
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
