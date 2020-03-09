import * as classNames from 'classnames';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import TabList from 'src/components/core/TabList';
import TabPanel from 'src/components/core/TabPanel';
import TabPanels from 'src/components/core/TabPanels';
import Typography from 'src/components/core/Typography';
import { safeGetTabRender } from 'src/utilities/safeGetTabRender';
import Notice from '../Notice';

type ClassNames = 'root' | 'inner' | 'copy' | 'tabs' | 'panelBody';

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
    tabs: {
      margin: `${theme.spacing(1)}px 0`
    },
    panelBody: {
      padding: `${theme.spacing(2)}px 0 0`
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
    const value = this.props.value ?? this.state.value;

    // if this bombs the app shouldn't crash
    const render = safeGetTabRender(tabs, value);

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

          <Tabs defaultIndex={value}>
            <TabList>
              {tabs.map((tab, index) => (
                <Tab key={index}>{tab.title}</Tab>
              ))}
            </TabList>
            <TabPanels>
              {tabs.map((tab, index) => (
                <TabPanel key={index}>{tab.render(rest.children)}</TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </div>
      </Paper>
    );
  }
}

export default withStyles(styles)(TabbedPanel) as React.ComponentType<Props>;
