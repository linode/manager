import { compose, filter, find, lensPath, map, pathOr, prop, propEq, set } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { StickyContainer } from 'react-sticky';

import AppBar from '@material-ui/core/AppBar';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';

import CircleProgress from 'src/components/CircleProgress';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import PromiseLoader from 'src/components/PromiseLoader';
import { ExtendedRegion } from 'src/components/SelectRegionPanel';
import { dcDisplayNames } from 'src/constants';
import { withRegions } from 'src/context/regions';
import { withTypes } from 'src/context/types';
import { getImages } from 'src/services/images';
import { getLinodes } from 'src/services/linodes';
import { parseQueryParams } from 'src/utilities/queryParams';

import { displayType, typeLabelDetails } from 'src/features/linodes/presentation';
import { ExtendedLinode } from './SelectLinodePanel';
import { ExtendedType } from './SelectPlanPanel';
import FromBackupsContent from './TabbedContent/FromBackupsContent';
import FromImageContent from './TabbedContent/FromImageContent';
import FromLinodeContent from './TabbedContent/FromLinodeContent';
import FromStackScriptContent from './TabbedContent/FromStackScriptContent';

export type Info = { title: string, details?: string } | undefined;

export type TypeInfo = {
  title: string,
  details: string,
  monthly: number,
  backupsMonthly: number | null,
} | undefined;

type ClassNames =
  'root'
  | 'main';

  const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
  },
  main: {
  },
});

interface TypesContextProps {
  typesData: ExtendedType[];
  typesLoading: boolean;
}

interface RegionsContextProps {
  regionsData: ExtendedRegion[];
  regionsLoading: boolean;
}

interface PreloadedProps {
  images: { response: Linode.Image[] };
  linodes: { response: Linode.LinodeWithBackups[] };
}

type CombinedProps = TypesContextProps
  & RegionsContextProps
  & WithStyles<ClassNames>
  & PreloadedProps
  & RouteComponentProps<{}>;

interface State {
  selectedTab: number;
  selectedLinodeIDFromQueryString: number | undefined;
  selectedBackupIDFromQueryString: number | undefined;
  selectedStackScriptIDFromQueryString: number | undefined;
  selectedStackScriptTabFromQueryString: string | undefined;
}

interface QueryStringOptions {
  type: string;
  backupID: string;
  linodeID: string;
  stackScriptID: string;
  stackScriptUsername: string;
}

const preloaded = PromiseLoader<{}>({
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
    selectedTab: pathOr(0, ['history', 'location', 'state', 'selectedTab'], this.props),
    selectedLinodeIDFromQueryString: undefined,
    selectedBackupIDFromQueryString: undefined,
    selectedStackScriptIDFromQueryString: undefined,
    selectedStackScriptTabFromQueryString: undefined,
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

    if(options.stackScriptUsername) {
      this.setState({selectedStackScriptTabFromQueryString: options.stackScriptUsername})
    }

    if(options.stackScriptID) {
      this.setState({selectedStackScriptIDFromQueryString: +options.stackScriptID || undefined})
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
    if (!selectedTypeID || !this.props.typesData) { return null; }
    const type = this.getTypeInfo(selectedTypeID);
    if (!type) { return null; }
    return type.backupsMonthly;
  }

  extendLinodes = (linodes: Linode.Linode[]): ExtendedLinode[] => {
    const images = this.props.images.response || [];
    const types = this.props.typesData || [];
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
            regions={this.props.regionsData}
            images={this.props.images.response}
            types={this.props.typesData}
            getTypeInfo={this.getTypeInfo}
            getRegionInfo={this.getRegionInfo}
            history={this.props.history}
            handleDisablePasswordField={this.handleDisablePasswordField}
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
                      the same password and SSH Keys (if any) as the original Linode`,
            }}
            selectedBackupFromQuery={this.state.selectedBackupIDFromQueryString}
            selectedLinodeFromQuery={this.state.selectedLinodeIDFromQueryString}
            linodes={this.props.linodes.response}
            types={this.props.typesData}
            extendLinodes={this.extendLinodes}
            getBackupsMonthlyPrice={this.getBackupsMonthlyPrice}
            getTypeInfo={this.getTypeInfo}
            getRegionInfo={this.getRegionInfo}
            history={this.props.history}
          />
        );
      },
    },
    {
      title: 'Clone from Existing',
      render: () => {
        return (
          <FromLinodeContent
            notice={{
              level: 'warning',
              text: `This newly created Linode wil be created with
                      the same password and SSH Keys (if any) as the original Linode`,
            }}
            getBackupsMonthlyPrice={this.getBackupsMonthlyPrice}
            regions={this.props.regionsData}
            types={this.props.typesData}
            linodes={this.props.linodes.response}
            extendLinodes={this.extendLinodes}
            getTypeInfo={this.getTypeInfo}
            getRegionInfo={this.getRegionInfo}
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
            regions={this.props.regionsData}
            images={this.props.images.response}
            types={this.props.typesData}
            getTypeInfo={this.getTypeInfo}
            getRegionInfo={this.getRegionInfo}
            history={this.props.history}
            selectedStackScriptFromQuery={this.state.selectedStackScriptIDFromQueryString}
            selectedTabFromQuery={this.state.selectedStackScriptTabFromQueryString}
            handleDisablePasswordField={this.handleDisablePasswordField}
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
    const typeInfo = this.reshapeTypeInfo(this.props.typesData.find(
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

  getRegionInfo = (selectedRegionID: string | null): Info => {
    const selectedRegion = this.props.regionsData.find(
      region => region.id === selectedRegionID);

    return selectedRegion && {
      title: selectedRegion.country.toUpperCase(),
      details: selectedRegion.display,
    }
  }

  handleDisablePasswordField = (imageSelected: boolean) => {
    if (!imageSelected) {
      return {
        disabled: true,
        reason: 'You must first select an image to enter a root password',
      }
    }
    return;
  }

  render() {
    const { selectedTab } = this.state;

    const { classes, regionsLoading, typesLoading } = this.props;

    const tabRender = this.tabs[selectedTab].render;

    if (regionsLoading || typesLoading) { return <CircleProgress />; }

    return (
      <StickyContainer>
        <DocumentTitleSegment segment="Create a Linode" />
        <Grid container>
          <Grid item className={`${classes.main} mlMain`}>
            <Typography role="header" variant="headline" data-qa-create-linode-header>
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

const typesContext = withTypes(({ data, loading }) => {
  return {
    typesData: compose(
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
      /* filter out all the deprecated types because we don't to display them */
      filter<any>((eachType: Linode.LinodeType) => {
        if (!eachType.successor) {
          return true;
        }
        return eachType.successor === null
      }),
    )(data || []),
    typesLoading: loading,
  };
});

const regionsContext = withRegions(({
  data: regionsData,
  loading: regionsLoading,
}) => ({
  regionsLoading,
  regionsData: compose(
    map((region: Linode.Region) => ({
      ...region,
      display: dcDisplayNames[region.id],
    })),
  )(regionsData || [])
}))

const styled = withStyles(styles, { withTheme: true });

export default compose(
  preloaded,
  regionsContext,
  typesContext,
  styled,
  withRouter,
)(LinodeCreate);
