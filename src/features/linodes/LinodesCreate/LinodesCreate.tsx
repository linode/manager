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
  selectedImageID: string | null;
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

  handleImageClick = (event: React.MouseEvent<HTMLElement>, imageID: string) => {

    this.setState({ selectedImageID: imageID });
  }

  tabs = [
    {
      title: 'Create from Image',
      render: () => {
        const images  = pathOr([], ['response', 'data'], this.props.images);

        return <SelectImagePanel
          images={images}
          handleSelection={this.handleImageClick}
          selectedImageID={this.state.selectedImageID}
        />;
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
