import * as React from 'react';
import Axios from 'axios';
import * as moment from 'moment';
import { flatten, tail, groupBy, pathOr } from 'ramda';

import {
  withStyles,
  WithStyles,
  Theme,
  StyleRules,
} from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import Grid from 'material-ui/Grid';

import { API_ROOT } from 'src/constants';
import TabbedPanel from 'src/components/TabbedPanel';
import SelectionCard from 'src/components/SelectionCard';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';

const distroIcons = {
  Arch: 'archlinux',
  CentOS: 'centos',
  CoreOS: 'coreos',
  Debian: 'debian',
  Fedora: 'fedora',
  Gentoo: 'gentoo',
  openSUSE: 'opensuse',
  Slackware: 'slackware',
  Ubuntu: 'ubuntu',
};

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
}

type FinalProps = Props & WithStyles<Styles> & PreloadedProps;

interface State {
  selectedTab: number;
  selectedImageID: number | null;
}

const preloaded = PromiseLoader<Props>({
  images: () => Axios.get(`${API_ROOT}/images`)
    .then(response => response.data),
});

class LinodeCreate extends React.Component<FinalProps, State> {
  state = {
    selectedTab: 0,
    selectedImageID: null,
  };

  handleTabChange = (event: React.ChangeEvent<HTMLDivElement>, value: number) => {
    this.setState({ selectedTab: value });
  }

  renderCreateFromImage = () => {
    const images  = pathOr([], ['response', 'data'], this.props.images);

    const publicImages = images.filter(
      (image: Linode.Image) => image.id.startsWith('linode'));
    const publicImagesByVendor = groupBy<Linode.Image>(
      image => (image.vendor as string))(publicImages);
    const firstImagesByVendor = Object.keys(publicImagesByVendor).map(vendor => (
      (publicImagesByVendor[vendor] as Linode.Image[]).sort(
        (imageA, imageB) => {
          return (moment(imageB.created).diff(moment(imageA.created)));
        })[0]));
    const sortedFirstImagesByVendor = (firstImagesByVendor as Linode.Image[]).sort(
      (imageA, imageB) => {
        return Number(
          (imageA.vendor as string).toLowerCase() > (imageB.vendor as string).toLowerCase());
      });

    const restImagesByVendor = flatten<Linode.Image>(
      Object.keys(publicImagesByVendor).map(vendor => tail(
        (publicImagesByVendor[vendor] as Linode.Image[]).sort(
          (imageA, imageB) => {
            return (moment(imageB.created).diff(moment(imageA.created)));
          }))));
    const sortedRestImagesByVendor = (restImagesByVendor as Linode.Image[]).sort(
      (imageA, imageB) => {
        return Number(
          (imageA.vendor as string).toLowerCase() > (imageB.vendor as string).toLowerCase());
      });

    const privateImages = images.filter((image: Linode.Image) => image.id.startsWith('private'));

    return (
      <TabbedPanel
        header="Select Image Type"
        tabs={[
          {
            title: 'Public Images',
            render: () => (
              <React.Fragment>
                <Grid container>
                  {sortedFirstImagesByVendor.length
                  && sortedFirstImagesByVendor.map((image: Linode.Image) => (
                    <SelectionCard
                      renderIcon={() => {
                        return <span className={`fl-${distroIcons[(image.vendor as string)]}`} />;
                      }}
                      heading={(image.vendor as string)}
                      subheadings={[image.label]}
                    />
                  ))}
                </Grid>
                <ExpansionPanel name="Show Older Images">
                  <Grid container>
                    {sortedRestImagesByVendor.length
                    && sortedRestImagesByVendor.map((image: Linode.Image) => (
                      <SelectionCard
                        renderIcon={() => {
                          return <span className={`fl-${distroIcons[(image.vendor as string)]}`} />;
                        }}
                        heading={(image.vendor as string)}
                        subheadings={[image.label]}
                      />
                    ))}
                  </Grid>
                </ExpansionPanel>
              </React.Fragment>
            ),
          },
          {
            title: 'My Images',
            render: () => (
              <Grid container>
                {privateImages.length && privateImages.map((image: Linode.Image) => (
                  <SelectionCard
                    heading={(image.label as string)}
                    subheadings={[(image.description as string)]}
                  />
                ))}
              </Grid>
            ),
          },
        ]}
      >
      </TabbedPanel>
    );
  }

  tabs = [
    {
      title: 'Create from Image',
      render: this.renderCreateFromImage,
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
