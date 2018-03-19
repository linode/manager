import * as React from 'react';

import {
  withStyles,
  WithStyles,
  Theme,
  StyleRules,
} from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';

type Styles =
'root';

const styles = (theme: Theme & Linode.Theme): StyleRules => ({
  root: {
  },
});

interface Props {
}

type FinalProps = Props & WithStyles<Styles>;

interface State {
  selectedTab: number;
  selectedImageID: number | null;
}

class LinodeCreate extends React.Component<FinalProps, State> {
  state = {
    selectedTab: 0,
    selectedImageID: null,
  };

  handleTabChange = (event: React.ChangeEvent<HTMLDivElement>, value: number) => {
    this.setState({ selectedTab: value });
  }

  renderCreateFromImage() {
    return <div>Creating from Image</div>;
  }

  tabs = [
    {
      title: 'Create from Image',
      render: () => {
        return () => this.renderCreateFromImage();
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

export default withStyles(styles, { withTheme: true })<Props>(LinodeCreate);
