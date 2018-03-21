import * as React from 'react';
import Axios from 'axios';
import { pathOr } from 'ramda';

import {
  withStyles,
  WithStyles,
  Theme,
  StyleRules,
} from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';

import { API_ROOT } from 'src/constants';

import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import SelectImagePanel from './SelectImagePanel';
import SelectRegionPanel from './SelectRegionPanel';
import SelectPlanPanel from './SelectPlanPanel';
import LabelAndTagsPanel from './LabelAndTagsPanel';
import PasswordPanel from './PasswordPanel';
import AddonsPanel from './AddonsPanel';
import { typeLabelLong, typeLabel } from '../LinodesLanding/presentation';

type ChangeEvents = React.MouseEvent<HTMLElement> | React.ChangeEvent<HTMLInputElement>;

type Styles =
  'root';

const styles = (theme: Theme & Linode.Theme): StyleRules => ({
  root: {
  },
});

interface Props {
}

interface PreloadedProps {
  images: PromiseLoaderResponse<Linode.ManyResourceState<Linode.Image>>;
  regions: PromiseLoaderResponse<Linode.ManyResourceState<Linode.Region>>;
  types: PromiseLoaderResponse<Linode.ManyResourceState<Linode.LinodeType>>;
}

type CombinedProps = Props & WithStyles<Styles> & PreloadedProps;

interface State {
  selectedTab: number;
  selectedImageID: string | null;
  selectedRegionID: string | null;
  selectedTypeID: string | null;
  label: string | null;
  password: string | null;
  backups: boolean;
  privateIP: boolean;
  [index: string]: any;
}

const preloaded = PromiseLoader<Props>({
  images: () => Axios.get(`${API_ROOT}/images`)
    .then(response => response.data),

  types: () => Axios.get(`${API_ROOT}/linode/types`)
    .then(response => response.data)
    .then((response: Linode.ManyResourceState<Linode.LinodeType>) => {
      return {
        ...response,
        data: response.data.map((type) => {
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
              typeLabelLong(memory, disk, vcpus),
            ],
          });
        }),
      };
    }),

  regions: () => Axios.get(`${API_ROOT}/regions`)
    .then(response => response.data)
    .then((response) => {
      const display = {
        'us-east-1a': 'Newark, NJ',
        'us-south-1a': 'Dallas, TX',
        'us-west-1a': 'Fremont, CA',
        'us-southeast-1a': 'Atlanta, GA',
        'eu-central-1a': 'Frankfurt, DE',
        'eu-west-1a': 'London, UK',
        'ap-northeast-1a': 'Tokyo',
        'ap-northeast-1b': 'Tokyo 2, JP',
        'ap-south-1a': 'Singapore, SG',
      };

      return {
        ...response,
        data: response.data.map((region: Linode.Region) => ({
          ...region,
          display: display[region.id],
        })),
      };
    }),
});

class LinodeCreate extends React.Component<CombinedProps, State> {
  state = {
    selectedTab: 0,
    selectedImageID: null,
    selectedRegionID: null,
    selectedTypeID: null,
    label: null,
    password: null,
    backups: false,
    privateIP: false,
  };

  handleTabChange = (event: React.ChangeEvent<HTMLDivElement>, value: number) => {
    this.setState({ selectedTab: value });
  }

  updateStateFor = (key: string) => (event: ChangeEvents, value: string) => {
    this.setState(() => ({ [key]: value }));
  }

  tabs = [
    {
      title: 'Create from Image',
      render: () => {
        return (
          <React.Fragment>
            <SelectImagePanel
              images={pathOr([], ['response', 'data'], this.props.images)}
              handleSelection={this.updateStateFor}
              selectedImageID={this.state.selectedImageID}
              />
            <SelectRegionPanel
              regions={pathOr([], ['response', 'data'], this.props.regions)}
              handleSelection={this.updateStateFor}
              selectedID={this.state.selectedRegionID}
            />
            <SelectPlanPanel
              types={pathOr([], ['response', 'data'], this.props.types)}
              handleSelection={this.updateStateFor}
              selectedID={this.state.selectedTypeID}
            />
            <LabelAndTagsPanel
              label={this.state.label}
              handleChange={this.updateStateFor}
            />
            <PasswordPanel
              password={this.state.password}
              handleChange={this.updateStateFor}
            />
            <AddonsPanel
              backups={this.state.backups}
              privateIP={this.state.privateIP}
              handleChange={this.updateStateFor}
            />
          </React.Fragment>
        );
      },
    },
  ];

  render() {
    const { selectedTab } = this.state;
    const tabRender = this.tabs[selectedTab].render;

    return (
      <React.Fragment>
        <Typography variant="headline">Create New Linode</Typography>
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
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true })<Props>(LinodeCreate);

export default preloaded(styled);
