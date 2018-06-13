import * as React from 'react';
import { compose, find, lensPath, map, pathOr, prop, propEq, set } from 'ramda';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { StickyContainer } from 'react-sticky';

import { withStyles, WithStyles, Theme, StyleRules } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';

import { parseQueryParams } from 'src/utilities/queryParams';
import { dcDisplayNames } from 'src/constants';
import {
  getLinodes,
} from 'src/services/linodes';
import { getImages } from 'src/services/images';

import Grid from 'src/components/Grid';
import PromiseLoader from 'src/components/PromiseLoader';

import FromBackupsContent from './TabbedContent/FromBackupsContent';
import FromImageContent from './TabbedContent/FromImageContent';
import FromLinodeContent from './TabbedContent/FromLinodeContent';
import FromStackScriptContent from './TabbedContent/FromStackScriptContent';

import { ExtendedLinode } from './SelectLinodePanel';
import { ExtendedRegion } from 'src/components/SelectRegionPanel';
import { ExtendedType } from './SelectPlanPanel';
import { typeLabelDetails, displayType } from '../presentation';

type Info = { title: string, details?: string } | undefined;

export type TypeInfo = {
  title: string,
  details: string,
  monthly: number,
  backupsMonthly: number | null,
} | undefined;

type Styles =
  'root'
  | 'main';

const styles = (theme: Theme & Linode.Theme): StyleRules => ({
  root: {
  },
  main: {
  },
});

interface Props {
}

interface ConnectedProps {
  types: ExtendedType[];
  regions: ExtendedRegion[];
}

interface PreloadedProps {
  images: { response: Linode.Image[] };
  linodes: { response: Linode.LinodeWithBackups[] };
}

type CombinedProps = Props
  & ConnectedProps
  & WithStyles<Styles>
  & PreloadedProps
  & RouteComponentProps<{}>;

interface State {
  selectedTab: number;
  selectedLinodeIDFromQueryString: number | undefined;
  selectedBackupIDFromQueryString: number | undefined;
}

interface QueryStringOptions {
  type: string;
  backupID: string;
  linodeID: string;
}

const preloaded = PromiseLoader<Props>({
  linodes: () => getLinodes()
    /*
     * @todo: We're only allowing the user to select from their first 100
     * Linodes
     */
    .then(response => response.data || []),

  images: () => getImages()
    .then(response => response.data || []),
});

const formatLinodeSubheading = (typeInfo: string, imageInfo: string) => {
  const subheading = imageInfo
    ? `${typeInfo}, ${imageInfo}`
    : `${typeInfo}`;
  return [subheading];
};

export class LinodeCreate extends React.Component<CombinedProps, State> {
  state: State = {
    selectedTab: 0,
    selectedLinodeIDFromQueryString: undefined,
    selectedBackupIDFromQueryString: undefined,
  };

  mounted: boolean = false;

  componentDidMount() {
    this.mounted = true;
    this.updateStateFromQuerystring();
  }

  componentDidUpdate(prevProps: CombinedProps) {
    const prevSearch = prevProps.location.search;
    const { location: { search: nextSearch } } = this.props;
    if (prevSearch !== nextSearch) {
      this.updateStateFromQuerystring();
    }
  }

  updateStateFromQuerystring() {
    const { location: { search } } = this.props;
    const options: QueryStringOptions =
      parseQueryParams(search.replace('?', '')) as QueryStringOptions;
    if (options.type === 'fromBackup') {
      this.setState({ selectedTab: this.backupTabIndex });
    } else if (options.type === 'fromStackScript') {
      this.setState({ selectedTab: this.stackScriptTabIndex });
    }

    if (options.linodeID) {
      this.setState({ selectedLinodeIDFromQueryString: Number(options.linodeID) || undefined });
    }

    if (options.backupID) {
      this.setState({ selectedBackupIDFromQueryString: Number(options.backupID) || undefined });
    }
  }

  handleTabChange = (event: React.ChangeEvent<HTMLDivElement>, value: number) => {
    this.setState({
      selectedTab: value,
    });
  }

  getBackupsMonthlyPrice = (selectedTypeID: string | null): number | null => {
    if (!selectedTypeID || !this.props.types) { return null; }
    const type = this.getTypeInfo(selectedTypeID);
    if (!type) { return null; }
    return type.backupsMonthly;
  }

  extendLinodes = (linodes: Linode.Linode[]): ExtendedLinode[] => {
    const images = this.props.images.response || [];
    const types = this.props.types || [];
    return linodes.map(linode =>
      compose<Linode.Linode, Partial<ExtendedLinode>, Partial<ExtendedLinode>>(
        set(lensPath(['heading']), linode.label),
        set(lensPath(['subHeadings']),
          (formatLinodeSubheading)(
            displayType(linode.type, types),
            compose<Linode.Image[], Linode.Image, string>(
              prop('label'),
              find(propEq('id', linode.image)),
            )(images),
          ),
        ),
      )(linode) as ExtendedLinode,
    );
  }

  tabs = [
    {
      title: 'Create from Image',
      render: () => {
        return (
          <FromImageContent
            getBackupsMonthlyPrice={this.getBackupsMonthlyPrice}
            regions={this.props.regions}
            images={this.props.images.response}
            types={this.props.types}
            getTypeInfo={this.getTypeInfo}
            getRegionName={this.getRegionName}
            history={this.props.history}
          />
        );
      },
    },
    {
      title: 'Create from Backup',
      render: () => {
        return (
          <FromBackupsContent
            notice={{
              level: 'warning',
              text: `This newly created Linode wil be created with
                the same password as the original Linode`,
            }}
            selectedBackupFromQuery={this.state.selectedBackupIDFromQueryString}
            selectedLinodeFromQuery={this.state.selectedLinodeIDFromQueryString}
            linodes={this.props.linodes.response}
            types={this.props.types}
            extendLinodes={this.extendLinodes}
            getBackupsMonthlyPrice={this.getBackupsMonthlyPrice}
            getTypeInfo={this.getTypeInfo}
            getRegionName={this.getRegionName}
            history={this.props.history}
          />
        );
      },
    },
    {
      title: 'Clone From Existing',
      render: () => {
        return (
          <FromLinodeContent
            notice={{
              level: 'warning',
              text: `This newly created Linode wil be created with
                            the same password as the original Linode`,
            }}
            getBackupsMonthlyPrice={this.getBackupsMonthlyPrice}
            regions={this.props.regions}
            types={this.props.types}
            linodes={this.props.linodes.response}
            extendLinodes={this.extendLinodes}
            getTypeInfo={this.getTypeInfo}
            getRegionName={this.getRegionName}
            history={this.props.history}
          />
        );
      },
    },
    {
      title: 'Create from StackScript',
      render: () => {
        return (
          <FromStackScriptContent
            getBackupsMonthlyPrice={this.getBackupsMonthlyPrice}
            regions={this.props.regions}
            images={this.props.images.response}
            types={this.props.types}
            getTypeInfo={this.getTypeInfo}
            getRegionName={this.getRegionName}
            history={this.props.history}
          />
        );
      },
    },
  ];

  imageTabIndex = this.tabs.findIndex(tab => tab.title.toLowerCase().includes('image'));
  backupTabIndex = this.tabs.findIndex(tab => tab.title.toLowerCase().includes('backup'));
  cloneTabIndex = this.tabs.findIndex(tab => tab.title.toLowerCase().includes('clone'));
  stackScriptTabIndex = this.tabs.findIndex(tab => tab.title.toLowerCase().includes('stackscript'));

  componentWillUnmount() {
    this.mounted = false;
  }

  getImageInfo = (image: Linode.Image | undefined): Info => {
    return image && {
      title: `${image.vendor || image.label}`,
      details: `${image.vendor ? image.label : ''}`,
    };
  }

  getTypeInfo = (selectedTypeID: string | null): TypeInfo => {
    const typeInfo = this.reshapeTypeInfo(this.props.types.find(
      type => type.id === selectedTypeID));

    return typeInfo;
  }

  reshapeTypeInfo = (type: ExtendedType | undefined): TypeInfo => {
    return type && {
      title: type.label,
      details: `${typeLabelDetails(type.memory, type.disk, type.vcpus)}`,
      monthly: type.price.monthly,
      backupsMonthly: type.addons.backups.price.monthly,
    };
  }

  getRegionName = (selectedRegionID: string | null): string | undefined => {
    const selectedRegion = this.props.regions.find(
      region => region.id === selectedRegionID);

    return selectedRegion && selectedRegion.display;
  }

  render() {
    const { selectedTab } = this.state;

    const { classes } = this.props;

    const tabRender = this.tabs[selectedTab].render;

    return (
      <StickyContainer>
        <Grid container>
          <Grid item className={`${classes.main} mlMain`}>
            <Typography variant="headline" data-qa-create-linode-header>
              Create New Linode
            </Typography>
            <AppBar position="static" color="default">
              <Tabs
                value={selectedTab}
                onChange={this.handleTabChange}
                indicatorColor="primary"
                textColor="primary"
              >
                {
                  this.tabs.map((tab, idx) =>
                    <Tab
                      key={idx}
                      label={tab.title}
                      data-qa-create-from={tab.title}
                    />)
                }
              </Tabs>
            </AppBar>
          </Grid>
          {tabRender()}
        </Grid>
      </StickyContainer>
    );
  }
}
const connected = connect((state: Linode.AppState) => ({
  types: compose(
    map<Linode.LinodeType, ExtendedType>((type) => {
      const { label, memory, vcpus, disk, price: { monthly, hourly } } = type;
      return {
        ...type,
        heading: label,
        subHeadings: [
          `$${monthly}/mo ($${hourly}/hr)`,
          typeLabelDetails(memory, disk, vcpus),
        ],
      };
    }),
    pathOr([], ['resources', 'types', 'data', 'data']),
  )(state),
  regions: compose(
    map((region: Linode.Region) => ({
      ...region,
      display: dcDisplayNames[region.id],
    })),
    pathOr([], ['resources', 'regions', 'data', 'data']),
  )(state),
}));

const styled = withStyles(styles, { withTheme: true });

export default compose(
  connected,
  preloaded,
  styled,
  withRouter,
)(LinodeCreate);
