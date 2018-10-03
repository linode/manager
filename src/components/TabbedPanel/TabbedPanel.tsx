import * as React from 'react';

import AppBar from '@material-ui/core/AppBar';
import Hidden from '@material-ui/core/Hidden';
import Menu from '@material-ui/core/Menu';
import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, WithStyles, withStyles } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUp from '@material-ui/icons/KeyboardArrowUp'; 

import Button from 'src/components/Button';
import Notice from '../Notice';

type ClassNames = 'root'
  | 'inner'
  | 'copy'
  | 'tabs'
  | 'panelBody'
  | 'caret'
  | 'button'
  | 'menu'
  | 'mobileTabs'
  | 'mobileTab';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.color.white,
  },
  button: {
    marginTop: theme.spacing.unit * 2,
    '&[aria-expanded]': {
      background: theme.palette.primary.main,
      color: theme.color.white,
    },
  },
  menu: {},
  inner: {
    padding: theme.spacing.unit * 3,
  },
  copy: {
    fontSize: '0.875rem',
    marginTop: theme.spacing.unit,
  },
  tabs: {
    margin: `${theme.spacing.unit}px 0`,
  },
  panelBody: {
    padding: `${theme.spacing.unit * 2}px 0 0`,
  },
  caret: {
    position: 'relative',
    top: 2,
    left: 2,
    marginLeft: theme.spacing.unit / 2,
  },
  mobileTabs: {
    margin: 0,
    '& [class*="MuiTabs-flexContainer"]': {
      flexDirection: 'column',
    },
    '& [class*="TabIndicator-root"]': {
      display: 'none',
    },
    '& [class*="MuiTab-wrapper"]': {
      alignItems: 'flex-start',
    },
  },
  mobileTab: {},
});

export interface Tab {
  title: string;
  render: (props: any) => JSX.Element | null;
}

interface State {
  anchorEl?: HTMLElement;
  value: number;
  tabText: any;
}

interface Props {
  header: string;
  error?: string;
  copy?: string;
  rootClass?: string;
  tabs: Tab[];
  [index: string]: any;
  initTab?: number;
  shrinkTabContent?: string;
  handleTabChange?: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class TabbedPanel extends React.Component<CombinedProps, State> {
  state = {
    anchorEl: undefined,
    value: this.props.initTab || 0,
    tabText: '',
  };

  handleChange = (event: React.ChangeEvent<HTMLDivElement>, value: number) => {
    if (this.props.handleTabChange) {
      this.props.handleTabChange();
    }
    this.setState({
      value,
      tabText: event.currentTarget.textContent
    });
  }

  handleClick = (event: React.MouseEvent<HTMLElement>) => {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose = () => {
    this.setState({ anchorEl: undefined });
  }

  render() {
    const { classes, header, tabs, shrinkTabContent, copy, error, rootClass, ...rest } = this.props;
    const { anchorEl, value, tabText } = this.state;
    const render = tabs[value].render;

    return (
      <Paper className={`${classes.root} ${rootClass}`} data-qa-tp={header}>
        <div className={`${classes.inner}`}>
          {error && <Notice text={error} error />}
          <Typography role="header" variant="title" data-qa-tp-title>{header}</Typography>
          {copy && <Typography component="div" className={classes.copy}
            data-qa-tp-copy>{copy}</Typography>}
          <AppBar position="static" color="default">
            <Hidden smDown>
              <Tabs
                value={value}
                onChange={this.handleChange}
                indicatorColor="primary"
                textColor="primary"
                className={`${classes.tabs}`}
              >
                {tabs.map((tab, idx) => <Tab key={idx} label={tab.title} data-qa-tab={tab.title} />)}
              </Tabs>
            </Hidden>
          </AppBar>
          <Hidden mdUp>
            <Button
              type="secondary"
              aria-owns={anchorEl ? 'navigate' : undefined}
              aria-expanded={anchorEl ? true : undefined}
              aria-haspopup="true"
              onClick={this.handleClick}
              className={classes.button}
            >
              {tabText ? tabText : tabs[0].title} {
                anchorEl
                  ? <KeyboardArrowUp className={classes.caret} />
                  : <KeyboardArrowDown className={classes.caret} />
              }
            </Button>
            <Menu
              id="navigate"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={this.handleClose}
              getContentAnchorEl={undefined}
              PaperProps={{ square: true }}
              anchorOrigin={{ vertical: 50, horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              className={classes.menu}
            >
              <Tabs
                value={value}
                onChange={this.handleChange}
                indicatorColor="primary"
                textColor="primary"
                className={`${classes.mobileTabs}`}
              >
                {tabs.map((tab, idx) =>
                  <Tab
                    key={idx}
                    label={tab.title}
                    data-qa-tab={tab.title}
                    className={classes.mobileTab}
                    onClick={this.handleClose}
                  />
                )}
              </Tabs>
            </Menu>
          </Hidden>
          <Typography component="div" className={`${classes.panelBody} ${shrinkTabContent}`}
            data-qa-tab-body>
            {render(rest)}
          </Typography>
        </div>
      </Paper>
    );
  }
}

export default withStyles(styles, { withTheme: true })(TabbedPanel) as React.ComponentType<Props>;
