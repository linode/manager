import * as React from 'react';
import { compose, set, propEq, prop, find, lensPath } from 'ramda';

import {
  withRouter,
  RouteComponentProps,
} from 'react-router-dom';
import { StickyContainer, Sticky, StickyProps } from 'react-sticky';

import {
  withStyles,
  WithStyles,
  Theme,
  StyleRules,
} from 'material-ui/styles';
import Grid from 'src/components/Grid';
import Typography from 'material-ui/Typography';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';

import { dcDisplayNames } from 'src/constants';
import { createLinode, getLinodeTypes, allocatePrivateIP, getLinodes } from 'src/services/linodes';
import { getImages } from 'src/services/images';
import { getRegions } from 'src/services/misc';
import PromiseLoader from 'src/components/PromiseLoader';

import SelectLinodePanel, { ExtendedLinode } from './SelectLinodePanel';
import SelectImagePanel from './SelectImagePanel';
import SelectBackupPanel from './SelectBackupPanel';
import SelectRegionPanel, { ExtendedRegion } from './SelectRegionPanel';
import SelectPlanPanel, { ExtendedType } from './SelectPlanPanel';
import LabelAndTagsPanel from './LabelAndTagsPanel';
import PasswordPanel from './PasswordPanel';
import AddonsPanel from './AddonsPanel';
import { typeLabelDetails, typeLabel } from '../presentation';
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

interface PreloadedProps {
  images: { response: Linode.Image[] };
  regions: { response: ExtendedRegion[] };
  types: { response: ExtendedType[] };
  linodes: { response: Linode.Linode[] };
}

type CombinedProps = Props & WithStyles<Styles> & PreloadedProps & RouteComponentProps<{}>;

interface State {
  selectedTab: number;
  selectedLinodeID?: number;
  selectedBackupID?: number;
  selectedImageID: string | null;
  selectedRegionID: string | null;
  selectedTypeID: string | null;
  label: string | null;
  password: string | null;
  backups: boolean;
  privateIP: boolean;
  errors?: Linode.ApiFieldError[];
  [index: string]: any;
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

  types: () => getLinodeTypes()
    .then((response) => {
      return response.data.map((type) => {
        const {
          memory,
          vcpus,
          disk,
          price: { monthly, hourly },
        } = type;

        return ({
          ...type,
          heading: typeLabel(memory),
          subHeadings: [
            `$${monthly}/mo ($${hourly}/hr)`,
            typeLabelDetails(memory, disk, vcpus),
          ],
        });
      }) || [];
    }),

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

const getErrorFor = (field: string, arr: Linode.ApiFieldError[] = []): undefined | string => {
  const err = arr.find(e => e.field === field);
  if (!err) {
    return;
  }
  return err.reason.replace(err.field, errorResources[err.field]);
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
  };

  constructor(props: CombinedProps) {
    super(props);
    this.extendLinodes.bind(this);
  }

  mounted: boolean = false;

  handleTabChange = (event: React.ChangeEvent<HTMLDivElement>, value: number) => {
    this.setState({ selectedTab: value });
  }

  updateStateFor = (key: string) => (event: ChangeEvents, value: string) => {
    this.setState(() => ({ [key]: value }));
  }

  getBackupsMonthlyPrice(): number | null {
    const { selectedTypeID } = this.state;
    if (!selectedTypeID || !this.props.types.response) { return null; }
    const type = this.props.types.response.find(type => type.id === selectedTypeID);
    if (!type) { return null; }
    return type.addons.backups.price.monthly;
  }

  extendLinodes(linodes: Linode.Linode[]): ExtendedLinode[] {
    const images = this.props.images.response || [];
    const types = this.props.types.response || [];
    return linodes.map(linode =>
      compose<Linode.Linode, Partial<ExtendedLinode>, Partial<ExtendedLinode>>(
        set(lensPath(['heading']), linode.label),
        set(lensPath(['subHeadings']),
          (formatLinodeSubheading)(
            compose<Linode.LinodeType[], Linode.LinodeType, number, string>(
              (mem: number) => typeLabel(mem) || '',
              prop('memory'),
              find(propEq('id', linode.type)),
            )(types),
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
          <React.Fragment>
            <SelectImagePanel
              images={this.props.images.response}
              handleSelection={this.updateStateFor}
              selectedImageID={this.state.selectedImageID}
            />
            <SelectRegionPanel
              error={getErrorFor('region', this.state.errors)}
              regions={this.props.regions.response}
              handleSelection={this.updateStateFor}
              selectedID={this.state.selectedRegionID}
            />
            <SelectPlanPanel
              error={getErrorFor('type', this.state.errors)}
              types={this.props.types.response}
              onSelect={(id: string) => this.setState({ selectedTypeID: id })}
              selectedID={this.state.selectedTypeID}
            />
            <LabelAndTagsPanel
              error={getErrorFor('label', this.state.errors)}
              label={this.state.label}
              handleChange={this.updateStateFor}
            />
            <PasswordPanel
              error={getErrorFor('root_pass', this.state.errors)}
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
        return (
          <React.Fragment>
            <SelectLinodePanel
              error={getErrorFor('linode_id', this.state.errors)}
              linodes={compose(
                (linodes: Linode.Linode[]) => this.extendLinodes(linodes),
                linodesWithBackups,
              )(this.props.linodes.response)}
              selectedLinodeID={this.state.selectedLinodeID}
              handleSelection={this.updateStateFor}
            />
            <SelectBackupPanel
              error={getErrorFor('backup_id', this.state.errors)}
              selectedLinodeID={this.state.selectedLinodeID}
              selectedBackupID={this.state.selectedBackupID}
              handleSelection={this.updateStateFor}
            />
            <SelectRegionPanel
              error={getErrorFor('region', this.state.errors)}
              regions={this.props.regions.response}
              handleSelection={this.updateStateFor}
              selectedID={this.state.selectedRegionID}
            />
            <SelectPlanPanel
              error={getErrorFor('type', this.state.errors)}
              types={this.props.types.response}
              onSelect={(id: string) => this.setState({ selectedTypeID: id })}
              selectedID={this.state.selectedTypeID}
            />
            <LabelAndTagsPanel
              error={getErrorFor('label', this.state.errors)}
              label={this.state.label}
              handleChange={this.updateStateFor}
            />
            <PasswordPanel
              error={getErrorFor('root_pass', this.state.errors)}
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
  ];

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  onDeploy = () => {
    const { history } = this.props;
    const {
      selectedTab,
      selectedLinodeID,
      selectedBackupID,
      selectedImageID,
      selectedRegionID,
      selectedTypeID,
      label,
      password,
      backups,
      privateIP,
    } = this.state;

    if (selectedTab === 1) {
      /* we are creating from backup */
      if (!selectedLinodeID) {
        /* so a Linode selection is required */
        this.setState({
          errors: [
            { field: 'linode_id', reason: 'You must select a Linode' },
          ],
        });
        return;
      }
    }

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

        this.setState(() => ({
          errors: error.response && error.response.data && error.response.data.errors,
        }));
      });
  }

  getImageInfo = (image: Linode.Image | undefined): Info => {
    return image && {
      name: `${image.vendor || image.label}`,
      details: `${image.vendor ? image.label : ''}`,
    };
  }

  getTypeInfo = (type: ExtendedType | undefined): TypeInfo => {
    return type && {
      name: `${typeLabel(type.memory)}`,
      details: `${typeLabelDetails(type.memory, type.disk, type.vcpus)}`,
      monthly: type.price.monthly,
      backupsMonthly: this.getBackupsMonthlyPrice(),
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
      selectedTypeID,
      selectedRegionID,
    } = this.state;

    const { classes } = this.props;

    const imageInfo = this.getImageInfo(this.props.images.response.find(
      image => image.id === selectedImageID));

    const typeInfo = this.getTypeInfo(this.props.types.response.find(
      type => type.id === selectedTypeID));

    const regionName = this.getRegionName(this.props.regions.response.find(
      region => region.id === selectedRegionID));

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
          <Grid item className={`${classes.sidebar} mlSidebar`}>
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
                    onDeploy: this.onDeploy,
                  };
                  return (
                    <CheckoutBar {...combinedProps} />
                  );
                }
              }
            </Sticky>
          </Grid>
        </Grid>
      </StickyContainer>
    );
  }
}

const styled = withStyles(styles, { withTheme: true })<Props>(LinodeCreate);

export default preloaded(withRouter(styled as Linode.TodoAny));
