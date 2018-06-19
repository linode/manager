import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Typography from 'material-ui/Typography';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
// import Paper from 'material-ui/Paper';
// import TableBody from 'material-ui/Table/TableBody';
// import TableCell from 'material-ui/Table/TableCell';
// import TableHead from 'material-ui/Table/TableHead';
// import TableRow from 'material-ui/Table/TableRow';

import { compose } from 'ramda';

import Grid from 'src/components/Grid';
import IconTextLink from 'src/components/IconTextLink';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import PlusSquare from '../../../src/assets/icons/plus-square.svg';


type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props { }

interface State {
  selectedTab: number;
}

type CombinedProps = Props
  & SetDocsProps
  & WithStyles<ClassNames>;

export class StackScriptsLanding extends React.Component<CombinedProps, State> {
  state: State = {
    selectedTab: 0,
  };

  static docs = [
    {
      title: 'Automate Deployment with StackScripts',
      src: 'https://www.linode.com/docs/platform/stackscripts/',
      body: `Create Custom Instances and Automate Deployment with StackScripts.`,
    },
  ];

  handleTabClick = (event: React.ChangeEvent<HTMLDivElement>, value: number) => {
    this.setState({ selectedTab: value });
  }

  tabs = [
    {
      title: 'My StackScripts',
      render: () => {
        return (
          <React.Fragment>
            My StackScripts
          </React.Fragment>
        );
      },
    },
    {
      title: 'Linode StackScripts',
      render: () => {
        return (
          <React.Fragment>
            Linode StackScripts
          </React.Fragment>
        );
      },
    },
    {
      title: 'Community StackScripts',
      render: () => {
        return (
          <React.Fragment>
            Community StackScripts
          </React.Fragment>
        );
      },
    },
  ];

  render() {

    const { selectedTab } = this.state;

    return (
      <React.Fragment>
        <Grid container>
          <Grid item xs={9}>
            <Typography variant="headline">
              StackScripts
        </Typography>
          </Grid>
          <Grid item xs={3}>
            <IconTextLink
              SideIcon={PlusSquare}
              text="Create New StackScript"
              onClick={() => console.log('hello world')}
              title="Create New StackScript"
            />
          </Grid>
        </Grid>
        <AppBar position="static" color="default">
          <Tabs
            value={selectedTab}
            indicatorColor="primary"
            textColor="primary"
            onChange={this.handleTabClick}
          >
            {
              this.tabs.map((tab, idx) =>
                <Tab
                  key={idx}
                  label={tab.title}
                />)
            }
          </Tabs>
        </AppBar>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default compose(
  styled,
  setDocs(StackScriptsLanding.docs),
)(StackScriptsLanding);
