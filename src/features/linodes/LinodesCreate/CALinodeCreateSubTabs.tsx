import { parse } from 'querystring';
import * as React from 'react';
import AppBar from 'src/components/core/AppBar';
import MUITab from 'src/components/core/Tab';
import Paper from 'src/components/core/Paper';
import Tabs from 'src/components/core/Tabs';
import Typography from 'src/components/core/Typography';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import Grid from 'src/components/Grid';

type ClassNames = 'root' | 'inner';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.color.white
  },
  inner: {
    padding: theme.spacing.unit * 2,
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing.unit * 3
    }
  }
});

export interface Tab {
  title: string;
  render: () => JSX.Element;
}

interface Props {
  history: any;
  type: 'oneClick' | 'myImages';
}

interface State {
  selectedTab: number;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class CALinodeCreateSubTabs extends React.PureComponent<CombinedProps, State> {
  constructor(props: CombinedProps) {
    super(props);

    const tabsToRender =
      props.type === 'oneClick' ? this.oneClickTabs : this.myImagesTabs;

    /** get the query params as an object, excluding the "?" */
    const queryParams = parse(location.search.replace('?', ''));

    /** will be -1 if the query param is not found */
    const preSelectedTab = tabsToRender.findIndex((eachTab, index) => {
      return eachTab.title === queryParams.subtype;
    });

    this.state = {
      selectedTab: preSelectedTab !== -1 ? preSelectedTab : 0
    };
  }

  oneClickTabs: Tab[] = [
    {
      title: 'One-Click Apps',
      render: () => {
        return <React.Fragment />;
      }
    },
    {
      title: 'Community StackScripts',
      render: () => {
        return <React.Fragment />;
      }
    }
  ];

  myImagesTabs: Tab[] = [
    {
      title: 'Backups and My Images',
      render: () => {
        return <React.Fragment />;
      }
    },
    {
      title: 'Clone From Existing Linode',
      render: () => {
        return <React.Fragment />;
      }
    },
    {
      title: 'My StackScripts',
      render: () => {
        return <React.Fragment />;
      }
    }
  ];

  handleTabChange = (
    event: React.ChangeEvent<HTMLDivElement>,
    value: number
  ) => {
    /** get the query params as an object, excluding the "?" */
    const queryParams = parse(location.search.replace('?', ''));

    this.props.history.push({
      search: `?type=${queryParams.type}&subtype=${event.target.textContent}`
    });
    this.setState({
      selectedTab: value
    });
  };

  render() {
    const { type, classes } = this.props;
    const { selectedTab } = this.state;

    const tabsToRender =
      type === 'oneClick' ? this.oneClickTabs : this.myImagesTabs;

    const selectedTabContentRender = tabsToRender[selectedTab].render;

    return (
      <React.Fragment>
        <Grid item className={`mlMain`}>
          <Paper className={`${classes.root}`}>
            <div className={`${classes.inner}`}>
              <Typography role="header" variant="h2">
                Create From
              </Typography>
              <AppBar position="static" color="default">
                <Tabs
                  value={selectedTab}
                  onChange={this.handleTabChange}
                  indicatorColor="primary"
                  textColor="primary"
                  variant="scrollable"
                  scrollButtons="on"
                >
                  {tabsToRender.map((tab, idx) => (
                    <MUITab
                      key={idx}
                      label={tab.title}
                      data-qa-create-from={tab.title}
                    />
                  ))}
                </Tabs>
              </AppBar>
            </div>
          </Paper>
        </Grid>
        {selectedTabContentRender()}
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(CALinodeCreateSubTabs);
