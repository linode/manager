import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import * as classNames from 'classnames';
import * as React from 'react';
import Hidden from 'src/components/core/Hidden';
import IconButton from 'src/components/core/IconButton';
import Paper from 'src/components/core/Paper';
import Tab from 'src/components/core/ReachTab';
import TabList from 'src/components/core/ReachTabList';
import TabPanel from 'src/components/core/ReachTabPanel';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from '../Notice';

type ClassNames =
  | 'root'
  | 'inner'
  | 'copy'
  | 'panelBody'
  | 'tab'
  | 'tabList'
  | 'tabPanelOuter'
  | 'tabPanel'
  | 'tabsWrapper'
  | 'leftScrollButton'
  | 'rightScrollButton'
  | 'scrollButton'
  | 'hidden';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      backgroundColor: theme.color.white
    },
    inner: {
      padding: theme.spacing(2),
      [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(3)
      }
    },
    copy: {
      fontSize: '0.875rem',
      marginTop: theme.spacing(1)
    },
    panelBody: {
      padding: `${theme.spacing(2)}px 0 0`
    },
    tabsWrapper: {
      position: 'relative'
    },
    tab: {
      '&[data-reach-tab]': {
        // This was copied over from our MuiTab styling in themeFactory. Some of this could probably be cleaned up.
        color: theme.color.tableHeaderText,
        minWidth: 50,
        textTransform: 'inherit',
        fontSize: '0.93rem',
        padding: '6px 16px',
        position: 'relative',
        overflow: 'hidden',
        maxWidth: 264,
        boxSizing: 'border-box',
        borderBottom: '2px solid transparent',
        minHeight: theme.spacing(1) * 6,
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        verticalAlign: 'middle',
        justifyContent: 'center',
        appearance: 'none',
        lineHeight: 1.3,
        [theme.breakpoints.up('md')]: {
          minWidth: 75
        },
        '&:hover': {
          color: theme.color.blue
        }
      },
      '&[data-reach-tab][data-selected]': {
        fontFamily: theme.font.bold,
        color: theme.color.headline,
        borderBottom: `2px solid ${theme.color.blue}`
      }
    },
    tabList: {
      '&[data-reach-tab-list]': {
        background: 'none !important',
        boxShadow: `inset 0 -1px 0 ${theme.color.border2}`,
        marginBottom: theme.spacing(3),
        [theme.breakpoints.down('md')]: {
          overflowX: 'scroll'
        }
      }
    },
    tabPanelOuter: {},
    tabPanel: {},
    scrollButton: {
      position: 'absolute',
      top: 0,
      padding: 0,
      '& svg': {
        width: 38,
        height: 39,
        padding: '7px 4px',
        borderRadius: '50%',
        backgroundColor: 'rgba(232, 232, 232, .9)',
        fill: theme.color.offBlack
      }
    },
    leftScrollButton: {
      left: 0
    },
    rightScrollButton: {
      right: 0
    },
    hidden: {
      visibility: 'hidden'
    }
  });

export interface Tab {
  title: string;
  render: (props: any) => JSX.Element | null;
}
interface Props {
  header: string;
  error?: string | JSX.Element;
  copy?: string;
  rootClass?: string;
  innerClass?: string;
  tabs: Tab[];
  [index: string]: any;
  initTab?: number;
  bodyClass?: string;
  noPadding?: boolean;
  handleTabChange?: (value?: number) => void;
  value?: number;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class TabbedPanel extends React.Component<CombinedProps> {
  state = { value: this.props.initTab || 0 };

  handleChange = (event: React.ChangeEvent<HTMLDivElement>, value: number) => {
    if (this.props.handleTabChange) {
      this.props.handleTabChange(value);
    }
    this.setState({ value });
  };

  render() {
    const {
      classes,
      header,
      tabs,
      shrinkTabContent,
      copy,
      error,
      rootClass,
      innerClass,
      noPadding,
      ...rest
    } = this.props;

    // Allow the consumer to pass in a custom tab value. Otherwise, read it from
    // component state.
    // const value = this.props.value ?? this.state.value;

    const scrollList = document.querySelector('div[data-reach-tab-list]');

    const scrollToStart = () => {
      scrollList!.scrollTo({
        behavior: 'smooth',
        top: 0,
        left: 0
      });
    };

    const scrollToEnd = () => {
      scrollList!.scrollTo({
        behavior: 'smooth',
        top: 0,
        left: scrollList!.scrollWidth
      });
    };

    // if this bombs the app shouldn't crash
    // const render = safeGetTabRender(tabs, value);

    return (
      <Paper className={`${classes.root} ${rootClass}`} data-qa-tp={header}>
        <div className={`${classes.inner} ${innerClass}`}>
          {error && <Notice text={error} error />}
          {header !== '' && (
            <Typography variant="h2" data-qa-tp-title>
              {header}
            </Typography>
          )}
          {copy && (
            <Typography
              component="div"
              className={classes.copy}
              data-qa-tp-copy
            >
              {copy}
            </Typography>
          )}

          <Tabs className={classes.tabsWrapper}>
            <TabList className={classes.tabList}>
              {tabs.map((tab, index) => (
                <Tab className={classes.tab} key={index}>
                  {tab.title}
                </Tab>
              ))}
            </TabList>

            <Hidden mdUp>
              <IconButton
                onClick={scrollToStart}
                aria-label="Scroll to start of list"
                className={classNames({
                  [classes.scrollButton]: true,
                  [classes.leftScrollButton]: true
                  // [classes.hidden]:
                  //   (scrollList && scrollList.scrollLeft) ===
                  //   (scrollList && scrollList.scrollWidth)
                })}
              >
                <ChevronLeftIcon />
              </IconButton>
              <IconButton
                onClick={scrollToEnd}
                aria-label="Scroll to end of list"
                className={classNames({
                  [classes.scrollButton]: true,
                  [classes.rightScrollButton]: true
                  // [classes.hidden]: (scrollList && scrollList.scrollLeft) === 0
                })}
              >
                <ChevronRightIcon />
              </IconButton>
            </Hidden>

            <TabPanels className={classes.tabPanelOuter}>
              {tabs.map((tab, index) => (
                <TabPanel className={classes.tabPanel} key={index}>
                  {tab.render(rest.children)}
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </div>
      </Paper>
    );
  }
}

export default withStyles(styles)(TabbedPanel) as React.ComponentType<Props>;
