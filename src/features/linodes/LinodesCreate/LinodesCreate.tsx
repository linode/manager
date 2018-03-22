import * as React from 'react';
import Axios from 'axios';
import { StickyContainer, Sticky, StickyProps } from 'react-sticky';

import {
  withStyles,
  WithStyles,
  Theme,
  StyleRules,
} from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';

import { API_ROOT } from 'src/constants';

import PromiseLoader from 'src/components/PromiseLoader';
import SelectImagePanel from './SelectImagePanel';
import SelectRegionPanel, { ExtendedRegion } from './SelectRegionPanel';
import SelectPlanPanel, { ExtendedType } from './SelectPlanPanel';
import LabelAndTagsPanel from './LabelAndTagsPanel';
import PasswordPanel from './PasswordPanel';
import AddonsPanel from './AddonsPanel';
import { typeLabelDetails, typeLabel } from '../presentation';
import CheckoutBar from './CheckoutBar';

type ChangeEvents = React.MouseEvent<HTMLElement> | React.ChangeEvent<HTMLInputElement>;

type Info = { name: string, details: string } | undefined;
type TypeInfo = { name: string, details: string, monthly: number } | undefined;

type Styles =
  'root';

const styles = (theme: Theme & Linode.Theme): StyleRules => ({
  root: {
  },
});

interface Props {
}

interface PreloadedProps {
  images: { response: Linode.Image[] };
  regions: { response: ExtendedRegion[] };
  types: { response: ExtendedType[] };
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
    .then(response => response.data)
    .then((data: Linode.ManyResourceState<Linode.Image>) => {
      return data.data.map(image => image) || [];
    }),

  types: () => Axios.get(`${API_ROOT}/linode/types`)
    .then(response => response.data)
    .then((data: Linode.ManyResourceState<Linode.LinodeType>) => {
      return data.data.map((type) => {
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

      return response.data.map((region: Linode.Region) => ({
        ...region,
        display: display[region.id],
      })) || [];
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
              images={this.props.images.response}
              handleSelection={this.updateStateFor}
              selectedImageID={this.state.selectedImageID}
              />
            <SelectRegionPanel
              regions={this.props.regions.response}
              handleSelection={this.updateStateFor}
              selectedID={this.state.selectedRegionID}
            />
            <SelectPlanPanel
              types={this.props.types.response}
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

  onDeploy = () => {
    const {
      selectedImageID,
      selectedRegionID,
      selectedTypeID,
      label,
      password,
      backups,
      // privateIP, /* This requires a separate API call! */
    } = this.state;

    Axios.post(`${API_ROOT}/linode/instances`, {
      region: selectedRegionID,
      type: selectedTypeID,
      label, /* optional */
      root_pass: password, /* required if image ID is provided */
      image: selectedImageID, /* optional */
      backups_enabled: backups, /* optional */
      booted: true,
    })
    .then((response) => {
      console.log('Succesful Linode Creation: ', response.data);
    })
    .catch((error) => {
      console.log('Linode Creation Errors: ', error.response.errors);
    });
  }

  getImageInfo = (image: Linode.Image | undefined): Info => {
    return image && {
      name: `${image.vendor}`,
      details: `${image.label}`,
    };
  }

  getTypeInfo = (type: ExtendedType | undefined): TypeInfo => {
    return type && {
      name: `${typeLabel(type.memory)}`,
      details: `${typeLabelDetails(type.memory, type.disk, type.vcpus)}`,
      monthly: type.price.monthly,
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

    const imageInfo = this.getImageInfo(this.props.images.response.find(
      image => image.id === selectedImageID));

    const typeInfo = this.getTypeInfo(this.props.types.response.find(
      type => type.id === selectedTypeID));

    const regionName = this.getRegionName(this.props.regions.response.find(
      region => region.id === selectedRegionID));

    const tabRender = this.tabs[selectedTab].render;

    return (
      <StickyContainer>
        <Typography variant="headline">Create New Linode</Typography>
        <Grid container>
          <Grid item md={12} lg={10} >
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
          <Grid item md={12} lg={2}>
            <Sticky>
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

export default preloaded(styled);
