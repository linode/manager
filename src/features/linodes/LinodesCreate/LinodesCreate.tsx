import * as React from 'react';
import { compose, find, lensPath, map, pathOr, prop, propEq, set } from 'ramda';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { StickyContainer, Sticky, StickyProps } from 'react-sticky';

import { withStyles, WithStyles, Theme, StyleRules } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';

import { parseQueryParams } from 'src/utilities/queryParams';
import { dcDisplayNames } from 'src/constants';
import {
  createLinode,
  allocatePrivateIP,
  getLinodes,
  cloneLinode,
} from 'src/services/linodes';
import { getImages } from 'src/services/images';

import Grid from 'src/components/Grid';
import PromiseLoader from 'src/components/PromiseLoader';
import CheckoutBar from 'src/components/CheckoutBar';

import FromBackupsContent from './TabbedContent/FromBackupsContent';
import FromImageContent from './TabbedContent/FromImageContent';
import FromLinodeContent from './TabbedContent/FromLinodeContent';
import FromStackScriptContent from './TabbedContent/FromStackScriptContent';

import { ExtendedLinode } from './SelectLinodePanel';
import { ExtendedRegion } from 'src/components/SelectRegionPanel';
import { ExtendedType } from './SelectPlanPanel';
import { typeLabelDetails, displayType } from '../presentation';
import { resetEventsPolling } from 'src/events';

type Info = { title: string, details?: string } | undefined;

export type TypeInfo = {
  title: string,
  details: string,
  monthly: number,
  backupsMonthly: number | null,
} | undefined;

type Styles =
  'root'
  | 'main'
  | 'sidebar';

const styles = (theme: Theme & Linode.Theme): StyleRules => ({
  root: {
  },
  main: {
  },
  sidebar: {
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
  selectedLinodeID?: number;
  selectedBackupID?: number;
  selectedBackupInfo?: Info;
  selectedDiskSize?: number;
  selectedImageID: string | null;
  selectedRegionID: string | null;
  selectedTypeID: string | null;
  selectedStackScriptID: number | null;
  label: string | null;
  password: string | null;
  backups: boolean;
  privateIP: boolean;
  errors?: Linode.ApiFieldError[];
  isMakingRequest: boolean;
  isGettingBackups: boolean;
  linodesWithBackups: Linode.LinodeWithBackups[] | null;
  userHasBackups: boolean;
}

interface QueryStringOptions {
  type: string;
  backupID: string;
  linodeID: string;
}

export interface StateToUpdate {
  stateKey: keyof Partial<State>;
  newValue: any;
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
    selectedImageID: null,
    selectedRegionID: null,
    selectedTypeID: null,
    selectedStackScriptID: null,
    label: null,
    password: null,
    backups: false,
    privateIP: false,
    errors: undefined,
    isMakingRequest: false,
    isGettingBackups: false,
    linodesWithBackups: null,
    userHasBackups: false,
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
    }

    if (options.linodeID) {
      this.setState({ selectedLinodeID: Number(options.linodeID) || undefined });
    }

    if (options.backupID) {
      this.setState({ selectedBackupID: Number(options.backupID) || undefined });
    }
  }

  handleTabChange = (event: React.ChangeEvent<HTMLDivElement>, value: number) => {
    this.setState({
      selectedTab: value,
      // reset state upon tab change
      selectedLinodeID: undefined,
      selectedBackupID: undefined,
      selectedBackupInfo: undefined,
      selectedDiskSize: undefined,
      selectedImageID: null,
      selectedRegionID: null,
      selectedTypeID: null,
      privateIP: false,
      errors: undefined,
      label: '',
    });
  }

  // ensure we're only allowed to update state that exists in this component
  updateState = (statesToUpdate: StateToUpdate[]) => {
    return statesToUpdate.forEach((stateToUpdate) => {
      this.setState({
        [stateToUpdate.stateKey]: stateToUpdate.newValue,
      } as Pick<State, keyof State>);
    });
  }

  getBackupsMonthlyPrice = (): number | null => {
    const { selectedTypeID } = this.state;
    if (!selectedTypeID || !this.props.types) { return null; }
    const type = this.getTypeInfo();
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

  scrollToTop = () => {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }

  tabs = [
    {
      title: 'Create from Image',
      render: () => {
        return (
          <FromImageContent
            errors={this.state.errors}
            updateFormState={this.updateState}
            getBackupsMonthlyPrice={this.getBackupsMonthlyPrice}
            regions={this.props.regions}
            images={this.props.images.response}
            types={this.props.types}
            backups={this.state.backups}
            privateIP={this.state.privateIP}
            label={this.state.label}
            password={this.state.password}
            selectedRegionID={this.state.selectedRegionID}
            selectedImageID={this.state.selectedImageID}
            selectedTypeID={this.state.selectedTypeID}
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
            errors={this.state.errors}
            updateFormState={this.updateState}
            selectedLinodeID={this.state.selectedLinodeID}
            selectedBackupID={this.state.selectedBackupID}
            selectedDiskSize={this.state.selectedDiskSize}
            selectedTypeID={this.state.selectedTypeID}
            linodes={this.props.linodes.response}
            types={this.props.types}
            label={this.state.label}
            backups={this.state.backups}
            privateIP={this.state.privateIP}
            extendLinodes={this.extendLinodes}
            getBackupsMonthlyPrice={this.getBackupsMonthlyPrice}
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
            errors={this.state.errors}
            updateFormState={this.updateState}
            getBackupsMonthlyPrice={this.getBackupsMonthlyPrice}
            regions={this.props.regions}
            images={this.props.images.response}
            types={this.props.types}
            backups={this.state.backups}
            linodes={this.props.linodes.response}
            privateIP={this.state.privateIP}
            label={this.state.label}
            selectedRegionID={this.state.selectedRegionID}
            selectedTypeID={this.state.selectedTypeID}
            selectedLinodeID={this.state.selectedLinodeID}
            selectedDiskSize={this.state.selectedDiskSize}
            extendLinodes={this.extendLinodes}
          />
        );
      },
    },
    {
      title: 'Create from StackScript',
      render: () => {
        return (
          <FromStackScriptContent
            errors={this.state.errors}
            updateFormState={this.updateState}
            getBackupsMonthlyPrice={this.getBackupsMonthlyPrice}
            regions={this.props.regions}
            images={this.props.images.response}
            types={this.props.types}
            backups={this.state.backups}
            privateIP={this.state.privateIP}
            label={this.state.label}
            password={this.state.password}
            selectedRegionID={this.state.selectedRegionID}
            selectedImageID={this.state.selectedImageID}
            selectedTypeID={this.state.selectedTypeID}
            selectedStackScriptID={this.state.selectedStackScriptID}
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

  onDeploy = () => {
    this.setState({ errors: [] });
    const {
      selectedTab,
      selectedLinodeID,
      selectedBackupID,
    } = this.state;

    if (selectedTab === this.backupTabIndex) {
      /* we are creating from backup */
      if (!selectedLinodeID) {
        this.setState({
          errors: [
            { field: 'linode_id', reason: 'You must select a Linode' },
          ],
        });
        return;
      }
      if (!selectedBackupID) {
        /* a backup selection is also required */
        this.scrollToTop();
        this.setState({
          errors: [
            { field: 'backup_id', reason: 'You must select a Backup' },
          ],
        });
        return;
      }
      this.createNewLinode();
    } else if (selectedTab === this.cloneTabIndex) {
      // creating a clone
      if (!selectedLinodeID) {
        this.scrollToTop();
        this.setState({
          errors: [
            { field: 'linode_id', reason: 'You must select a Linode' },
          ],
        });
        return;
      }
      this.cloneLinode();
    } else {
      // creating from image
      this.createNewLinode();
    }
  }

  createNewLinode = () => {
    const { history } = this.props;
    const {
      selectedImageID,
      selectedRegionID,
      selectedTypeID,
      label,
      password,
      backups,
      privateIP,
      selectedBackupID,
    } = this.state;

    this.setState({ isMakingRequest: true });

    createLinode({
      region: selectedRegionID,
      type: selectedTypeID,
      backup_id: Number(selectedBackupID) || undefined,
      label, /* optional */
      root_pass: password, /* required if image ID is provided */
      image: selectedImageID, /* optional */
      backups_enabled: backups, /* optional */
      booted: true,
    })
      .then((linode) => {
        if (privateIP) allocatePrivateIP(linode.id);
        resetEventsPolling();
        history.push('/linodes');
      })
      .catch((error) => {
        if (!this.mounted) { return; }

        this.scrollToTop();

        this.setState(() => ({
          errors: error.response && error.response.data && error.response.data.errors,
        }));
      })
      .finally(() => {
        // regardless of whether request failed or not, change state and enable the submit btn
        this.setState({ isMakingRequest: false });
      });
  }

  cloneLinode = () => {
    const { history } = this.props;
    const {
      selectedRegionID,
      selectedTypeID,
      selectedLinodeID,
      label, // optional
      backups, // optional
      privateIP,
    } = this.state;

    this.setState({ isMakingRequest: true });

    cloneLinode(selectedLinodeID!, {
      region: selectedRegionID,
      type: selectedTypeID,
      label,
      backups_enabled: backups,
    })
      .then((linode) => {
        if (privateIP) allocatePrivateIP(linode.id);
        resetEventsPolling();
        history.push('/linodes');
      })
      .catch((error) => {
        if (!this.mounted) { return; }

        this.scrollToTop();

        this.setState(() => ({
          errors: error.response && error.response.data && error.response.data.errors,
        }));
      })
      .finally(() => {
        // regardless of whether request failed or not, change state and enable the submit btn
        this.setState({ isMakingRequest: false });
      });
  }

  getImageInfo = (image: Linode.Image | undefined): Info => {
    return image && {
      title: `${image.vendor || image.label}`,
      details: `${image.vendor ? image.label : ''}`,
    };
  }

  getTypeInfo = (): TypeInfo => {
    const { selectedTypeID } = this.state;

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

  getRegionName = (region: ExtendedRegion | undefined): string | undefined => {
    return region && region.display;
  }

  render() {
    const {
      selectedTab,
      label,
      backups,
      selectedImageID,
      selectedRegionID,
      selectedBackupInfo,
    } = this.state;

    const { classes } = this.props;

    let imageInfo: Info;
    if (selectedTab === this.imageTabIndex) {
      imageInfo = this.getImageInfo(this.props.images.response.find(
        image => image.id === selectedImageID));
    } else if (selectedTab === this.backupTabIndex) {
      imageInfo = selectedBackupInfo;
    }

    const regionName = this.getRegionName(this.props.regions.find(
      region => region.id === selectedRegionID));

    const typeInfo = this.getTypeInfo();

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
            {tabRender()}
          </Grid>
          {selectedTab === this.backupTabIndex && !this.state.userHasBackups
            ? <React.Fragment />
            : <Grid item className={`${classes.sidebar} mlSidebar`}>
              <Sticky
                topOffset={-24}
                disableCompensation>
                {
                  (props: StickyProps) => {
                    const displaySections = [];
                    if (imageInfo) {
                      displaySections.push(imageInfo);
                    }

                    if (regionName) {
                      displaySections.push({ title: regionName });
                    }

                    if (typeInfo) {
                      displaySections.push(typeInfo);
                    }

                    if (backups && typeInfo && typeInfo.backupsMonthly) {
                      displaySections.push({
                        title: 'Backups Enabled',
                        ...(typeInfo.backupsMonthly &&
                          { details: `$${typeInfo.backupsMonthly.toFixed(2)} / monthly` }),
                      });
                    }

                    let calculatedPrice = pathOr(0, ['monthly'], typeInfo);
                    if (backups && typeInfo && typeInfo.backupsMonthly) {
                      calculatedPrice += typeInfo.backupsMonthly;
                    }

                    return (
                      <CheckoutBar
                        heading={`${label || 'Linode'} Summary`}
                        calculatedPrice={calculatedPrice}
                        disabled={this.state.isMakingRequest}
                        onDeploy={this.onDeploy}
                        displaySections={displaySections}
                        {...props}
                      />
                    );
                  }
                }
              </Sticky>
            </Grid>
          }
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
