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
import {
  createLinode,
  allocatePrivateIP,
  getLinodes,
  cloneLinode,
  getLinodeBackups,
} from 'src/services/linodes';
import { getImages } from 'src/services/images';

import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import PromiseLoader from 'src/components/PromiseLoader';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import FromBackupsContent from './TabbedContent/FromBackupsContent';


import SelectLinodePanel, { ExtendedLinode } from './SelectLinodePanel';
import SelectImagePanel from './SelectImagePanel';
import SelectRegionPanel, { ExtendedRegion } from 'src/components/SelectRegionPanel';
import SelectPlanPanel, { ExtendedType } from './SelectPlanPanel';
import LabelAndTagsPanel from 'src/components/LabelAndTagsPanel';
import PasswordPanel from './PasswordPanel';
import { typeLabelDetails, displayType } from '../presentation';
import CheckoutBar from 'src/components/CheckoutBar';
import { resetEventsPolling } from 'src/events';

type ChangeEvents = React.MouseEvent<HTMLElement> | React.ChangeEvent<HTMLInputElement>;

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

export interface State {
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
  userHasBackups: boolean;
}

interface QueryStringOptions {
  type: string;
  backupID: string;
  linodeID: string;
}

// const linodesWithBackups = (linodes: Linode.Linode[]) =>
//   linodes.filter(linode => linode.backups.enabled);

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
    if (value === this.backupTabIndex) {
      this.getLinodesWithBackups(this.props.linodes.response);
    }
  }

  resetSelections = () => {
    // reset all selections here
  }

  updateStateFor = (key: keyof State) => (event: ChangeEvents, value: any) => {
    this.setState(() => ({ [key]: value }));
  }

  // ensure we're only allowed to update state that exists in this component
  updateState = (key: keyof Partial<State>, value: any) => {
    this.setState({ [key]: value });
  }

  getLinodesWithBackups = (linodes: Linode.Linode[]) => {
    this.setState({ isGettingBackups: true });
    return Promise.map(linodes.filter(l => l.backups.enabled), (linode: Linode.Linode) => {
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
              regions={this.props.regions}
              handleSelection={id => this.setState({ selectedRegionID: id })}
              selectedID={this.state.selectedRegionID}
              copy="Determine the best location for your Linode."
            />
            <SelectPlanPanel
              error={hasErrorFor('type')}
              types={this.props.types}
              onSelect={(id: string) => this.setState({ selectedTypeID: id })}
              selectedID={this.state.selectedTypeID}
            />
            <LabelAndTagsPanel
              labelFieldProps={{
                label: 'Linode Label',
                value: this.state.label || '',
                onChange: e => this.setState({ label: e.target.value }),
                errorText: hasErrorFor('label'),
              }}
            />
            <PasswordPanel
              error={hasErrorFor('root_pass')}
              password={this.state.password}
              handleChange={v => this.setState({ password: v })}
            />
            {/* <AddonsPanel
              backups={this.state.backups}
              backupsMonthly={this.getBackupsMonthlyPrice()}
              privateIP={this.state.privateIP}
              handleChange={this.updateStateFor}
            /> */}
          </React.Fragment>
        );
      },
    },
    {
      title: 'Create from Backup',
      render: () => {
        return (
          <React.Fragment>
            <FromBackupsContent
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
              header={'Select Linode to Clone From'}
              handleSelection={linode => this.setState({
                selectedLinodeID: linode.id,
                selectedTypeID: null,
                selectedDiskSize: linode.specs.disk,
              })}
            />
            <React.Fragment>
              <SelectRegionPanel
                error={hasErrorFor('region')}
                regions={this.props.regions}
                handleSelection={id => this.setState({ selectedRegionID: id })}
                selectedID={this.state.selectedRegionID}
                copy="Determine the best location for your Linode."
              />
              <SelectPlanPanel
                error={hasErrorFor('type')}
                types={this.props.types}
                onSelect={(id: string) => this.setState({ selectedTypeID: id })}
                selectedID={this.state.selectedTypeID}
                selectedDiskSize={this.state.selectedDiskSize}
              />
              <LabelAndTagsPanel
                labelFieldProps={{
                  label: 'Linode Label',
                  value: this.state.label || '',
                  onChange: e => this.setState({ label: e.target.value }),
                  errorText: hasErrorFor('label'),
                }}
              />
            </React.Fragment>
            {/* <AddonsPanel
              backups={this.state.backups}
              backupsMonthly={this.getBackupsMonthlyPrice()}
              privateIP={this.state.privateIP}
              handleChange={this.updateStateFor}
            /> */}
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
          {!this.state.userHasBackups
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
