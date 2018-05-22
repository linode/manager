import * as React from 'react';
import { compose, find, lensPath, map, pathOr, prop, propEq, set } from 'ramda';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { StickyContainer, Sticky, StickyProps } from 'react-sticky';

import * as Promise from 'bluebird';

import { withStyles, WithStyles, Theme, StyleRules } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';

import { parseQueryParams } from 'src/utilities/queryParams';
import { dcDisplayNames } from 'src/constants';
import { createLinode, allocatePrivateIP, getLinodes,
   cloneLinode, getLinodeBackups } from 'src/services/linodes';
import { getImages } from 'src/services/images';
import { getRegions } from 'src/services/misc';

import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import PromiseLoader from 'src/components/PromiseLoader';
import CircleProgress from 'src/components/CircleProgress';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import Placeholder from 'src/components/Placeholder';


import SelectLinodePanel, { ExtendedLinode } from './SelectLinodePanel';
import SelectImagePanel from './SelectImagePanel';
import SelectBackupPanel from './SelectBackupPanel';
import SelectRegionPanel, { ExtendedRegion } from './SelectRegionPanel';
import SelectPlanPanel, { ExtendedType } from './SelectPlanPanel';
import LabelAndTagsPanel from './LabelAndTagsPanel';
import PasswordPanel from './PasswordPanel';
import AddonsPanel from './AddonsPanel';
import { typeLabelDetails, displayType } from '../presentation';
import CheckoutBar from './CheckoutBar';
import { resetEventsPolling } from 'src/events';

type ChangeEvents = React.MouseEvent<HTMLElement> | React.ChangeEvent<HTMLInputElement>;

type Info = { name: string, details: string } | undefined;

export type TypeInfo = {
  name: string,
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
}

interface PreloadedProps {
  images: { response: Linode.Image[] };
  regions: { response: ExtendedRegion[] };
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
  label: string | null;
  password: string | null;
  backups: boolean;
  privateIP: boolean;
  errors?: Linode.ApiFieldError[];
  isMakingRequest: boolean;
  [index: string]: any;
  isGettingBackups: boolean;
  linodesWithBackups: Linode.LinodeWithBackups[] | null;
}

interface QueryStringOptions {
  type: string;
  backupID: string;
  linodeID: string;
}

const linodesWithBackups = (linodes: Linode.Linode[]) =>
  linodes.filter(linode => linode.backups.enabled);

const preloaded = PromiseLoader<Props>({
  linodes: () => getLinodes()
    /*
     * @todo: We're only allowing the user to select from their first 100
     * Linodes
     */
    .then(response => response.data || []),

  images: () => getImages()
    .then(response => response.data || []),

  regions: () => getRegions()
    .then((response) => {
      return response.data.map((region: Linode.Region) => ({
        ...region,
        display: dcDisplayNames[region.id],
      })) || [];
    }),
});

const errorResources = {
  type: 'A plan selection',
  region: 'A region selection',
  label: 'A label',
  root_pass: 'A root password',
};

const formatLinodeSubheading = (typeInfo: string, imageInfo: string) => {
  const subheading = imageInfo
    ? `${typeInfo}, ${imageInfo}`
    : `${typeInfo}`;
  return [subheading];
};

class LinodeCreate extends React.Component<CombinedProps, State> {
  state: State = {
    selectedTab: 0,
    selectedImageID: null,
    selectedRegionID: null,
    selectedTypeID: null,
    label: null,
    password: null,
    backups: false,
    privateIP: false,
    errors: undefined,
    isMakingRequest: false,
    isGettingBackups: false,
    linodesWithBackups: null,
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
      this.getLinodesWithBackups(this.props.linodes.response);
    }

    if (options.linodeID) {
      this.setState({ selectedLinodeID: Number(options.linodeID) || undefined });
    }

    if (options.backupID) {
      this.setState({ selectedBackupID: Number(options.backupID) || undefined });
    }
  }

  handleTabChange = (event: React.ChangeEvent<HTMLDivElement>, value: number) => {
    this.setState({ selectedTab: value });
    if (value === this.backupTabIndex) {
      this.getLinodesWithBackups(this.props.linodes.response);
    }
  }

  updateStateFor = (key: string) => (event: ChangeEvents, value: any) => {
    this.setState(() => ({ [key]: value }));
  }

  getLinodesWithBackups = (linodes: Linode.Linode[]) => {
    this.setState({ isGettingBackups: true });
    return Promise.map(linodes, (linode: Linode.Linode) => {
      return getLinodeBackups(linode.id)
        .then((backups) => {
          return {
            ...linode,
            currentBackups: {
              ...backups,
            },
          };
        });
    }).then(data => this.setState({ linodesWithBackups: data, isGettingBackups: false }))
      .catch(err => this.setState({ isGettingBackups: false }));
  }

  getBackupsMonthlyPrice(): number | null {
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

  userHasBackups = () => {
    const { linodesWithBackups } = this.state;
    return linodesWithBackups!.some((linode: Linode.LinodeWithBackups) => {
      // automatic backups is an array, but snapshots are either null or an object
      // user can have up to 3 automatic backups, but one one snapshot
      return !!linode.currentBackups.automatic.length || !!linode.currentBackups.snapshot.current;
    });
  }

  tabs = [
    {
      title: 'Create from Image',
      render: () => {
        const hasErrorFor = getAPIErrorsFor(errorResources, this.state.errors);
        const generalError = hasErrorFor('none');
        return (
          <React.Fragment>
            {generalError &&
              <Notice text={generalError} error={true} />
            }
            <SelectImagePanel
              images={this.props.images.response}
              handleSelection={this.updateStateFor}
              selectedImageID={this.state.selectedImageID}
            />
            <SelectRegionPanel
              error={hasErrorFor('region')}
              regions={this.props.regions.response}
              handleSelection={this.updateStateFor}
              selectedID={this.state.selectedRegionID}
            />
            <SelectPlanPanel
              error={hasErrorFor('type')}
              types={this.props.types}
              onSelect={(id: string) => this.setState({ selectedTypeID: id })}
              selectedID={this.state.selectedTypeID}
            />
            <LabelAndTagsPanel
              error={hasErrorFor('label')}
              label={this.state.label}
              handleChange={this.updateStateFor}
            />
            <PasswordPanel
              error={hasErrorFor('root_pass')}
              password={this.state.password}
              handleChange={v => this.setState({ password: v })}
            />
            <AddonsPanel
              backups={this.state.backups}
              backupsMonthly={this.getBackupsMonthlyPrice()}
              privateIP={this.state.privateIP}
              handleChange={this.updateStateFor}
            />
          </React.Fragment>
        );
      },
    },
    {
      title: 'Create from Backup',
      render: () => {
        const hasErrorFor = getAPIErrorsFor(errorResources, this.state.errors);
        const generalError = hasErrorFor('none');
        return (
          <React.Fragment>
            {generalError &&
              <Notice text={generalError} error={true} />
            }
            {(this.state.isGettingBackups)
              ? <CircleProgress />
              : (!this.userHasBackups())
                ? <Placeholder
                copy="You either do not have backups enabled for any Linode
                or your Linodes have not been backed up. Please visit the 'Backups'
                panel in the Linode Settings view"
                title="Create from Backup"
                />
                : <React.Fragment>
                  <Notice text={`This newly created Linode wil be created with
            the same password as the original Linode`} warning={true} />
                  <SelectLinodePanel
                    error={hasErrorFor('linode_id')}
                    linodes={compose(
                      (linodes: Linode.Linode[]) => this.extendLinodes(linodes),
                      linodesWithBackups,
                    )(this.props.linodes.response)}
                    selectedLinodeID={this.state.selectedLinodeID}
                    handleSelection={this.updateStateFor}
                  />
                  <SelectBackupPanel
                    error={hasErrorFor('backup_id')}
                    backups={this.state.linodesWithBackups!
                      .filter((linode: Linode.LinodeWithBackups) => {
                        return linode.id === +this.state.selectedLinodeID!;
                      })}
                    selectedLinodeID={this.state.selectedLinodeID}
                    selectedBackupID={this.state.selectedBackupID}
                    handleSelection={this.updateStateFor}
                  />
                  <SelectRegionPanel
                    error={hasErrorFor('region')}
                    regions={this.props.regions.response}
                    handleSelection={this.updateStateFor}
                    selectedID={this.state.selectedRegionID}
                  />
                  <SelectPlanPanel
                    error={hasErrorFor('type')}
                    types={this.props.types}
                    onSelect={(id: string) => this.setState({ selectedTypeID: id })}
                    selectedID={this.state.selectedTypeID}
                    selectedDiskSize={this.state.selectedDiskSize}
                  />
                  <LabelAndTagsPanel
                    error={hasErrorFor('label')}
                    label={this.state.label}
                    handleChange={this.updateStateFor}
                  />
                  <AddonsPanel
                    backups={this.state.backups}
                    backupsMonthly={this.getBackupsMonthlyPrice()}
                    privateIP={this.state.privateIP}
                    handleChange={this.updateStateFor}
                  />
                </React.Fragment>}
          </React.Fragment>
        );
      },
    },
    {
      title: 'Clone From Existing',
      render: () => {
        const hasErrorFor = getAPIErrorsFor(errorResources, this.state.errors);
        const generalError = hasErrorFor('none');
        return (
          <React.Fragment>
            {generalError &&
              <Notice text={generalError} error={true} />
            }
            <Notice text={`This newly created Linode wil be created with
            the same password as the original Linode`} warning={true} />
            <SelectLinodePanel
              error={hasErrorFor('linode_id')}
              linodes={this.extendLinodes(this.props.linodes.response)}
              selectedLinodeID={this.state.selectedLinodeID}
              handleSelection={this.updateStateFor}
              header={'Select Linode to Clone From'}
            />
            <React.Fragment>
              <SelectRegionPanel
                error={hasErrorFor('region')}
                regions={this.props.regions.response}
                handleSelection={this.updateStateFor}
                selectedID={this.state.selectedRegionID}
              />
              <SelectPlanPanel
                error={hasErrorFor('type')}
                types={this.props.types}
                onSelect={(id: string) => this.setState({ selectedTypeID: id })}
                selectedID={this.state.selectedTypeID}
                selectedDiskSize={this.state.selectedDiskSize}
              />
              <LabelAndTagsPanel
                error={hasErrorFor('label')}
                label={this.state.label}
                handleChange={this.updateStateFor}
              />
            </React.Fragment>
            <AddonsPanel
              backups={this.state.backups}
              backupsMonthly={this.getBackupsMonthlyPrice()}
              privateIP={this.state.privateIP}
              handleChange={this.updateStateFor}
            />
          </React.Fragment>
        );
      },
    },
  ];

  imageTabIndex = this.tabs.findIndex(tab => tab.title.toLowerCase().includes('image'));
  backupTabIndex = this.tabs.findIndex(tab => tab.title.toLowerCase().includes('backup'));
  cloneTabIndex = this.tabs.findIndex(tab => tab.title.toLowerCase().includes('clone'));

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
      name: `${image.vendor || image.label}`,
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
      name: type.label,
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
      isGettingBackups,
    } = this.state;

    const { classes } = this.props;

    let imageInfo: Info;
    if (selectedTab === this.imageTabIndex) {
      imageInfo = this.getImageInfo(this.props.images.response.find(
        image => image.id === selectedImageID));
    } else if (selectedTab === this.backupTabIndex) {
      imageInfo = selectedBackupInfo;
    }

    const regionName = this.getRegionName(this.props.regions.response.find(
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
                {this.tabs.map((tab, idx) => <Tab key={idx} label={tab.title} />)}
              </Tabs>
            </AppBar>
            {tabRender()}
          </Grid>
          {isGettingBackups
            ? <React.Fragment />
            : selectedTab === this.backupTabIndex && !this.userHasBackups()
              ? <React.Fragment />
              : <Grid item className={`${classes.sidebar} mlSidebar`}>
                <Sticky
                  topOffset={-24}
                  disableCompensation>
                  {
                    (props: StickyProps) => {
                      const combinedProps = {
                        ...props,
                        label,
                        imageInfo,
                        typeInfo,
                        regionName,
                        backups,
                        disabled: this.state.isMakingRequest,
                        onDeploy: this.onDeploy,
                      };
                      return (
                        <CheckoutBar {...combinedProps} />
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
}));

const styled = withStyles(styles, { withTheme: true });

export default compose(
  connected,
  preloaded,
  styled,
  withRouter,
)(LinodeCreate);
