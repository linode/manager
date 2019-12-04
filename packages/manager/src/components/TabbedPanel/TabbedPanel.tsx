import * as classNames from 'classnames';
import React, { useState } from 'react';
import { compose } from 'recompose';
import AppBar from 'src/components/core/AppBar';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import Typography from 'src/components/core/Typography';
import { safeGetTabRender } from 'src/utilities/safeGetTabRender';
import Notice from '../Notice';

const useStyles = makeStyles((theme: Theme) => ({
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
}));

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
}

type CombinedProps = Props;

const TabbedPanel: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const [value, setValue] = useState<number>(props.initTab || 0);

  const {
    header,
    tabs,
    shrinkTabContent,
    copy,
    error,
    rootClass,
    innerClass,
    noPadding,
    ...rest
  } = props;

  // if this bombs the app shouldn't crash
  const render = safeGetTabRender(tabs, value);

  const handleChange = (
    event: React.ChangeEvent<HTMLDivElement>,
    value: number
  ) => {
    if (props.handleTabChange) {
      props.handleTabChange(value);
    }
    setValue(value);
  };

  // TODO should make the id references more custom
  const tabA11yProps = (index: number) => {
    return {
      id: `tab-${index}`,
      role: 'tab',
      'aria-controls': `tabpanel-${index}`
    };
  };

  const tabPanelA11yProps = (index: number) => {
    return {
      id: `tabpanel-${index}`,
      role: 'tabpanel',
      'aria-labelledby': `tab-${index}`
    };
  };

  return (
    <Paper className={`${classes.root} ${rootClass}`} data-qa-tp={header}>
      <div className={`${classes.inner} ${innerClass}`}>
        {error && <Notice text={error} error />}
        <Typography variant="h2" data-qa-tp-title>
          {header}
        </Typography>
        {copy && (
          <Typography component="div" className={classes.copy} data-qa-tp-copy>
            {copy}
          </Typography>
        )}
        <AppBar position="static" color="default" role="tablist">
          <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="primary"
            textColor="primary"
            className={`${classes.tabs}`}
            variant="scrollable"
            scrollButtons="on"
          >
            {tabs.map((tab, idx) => (
              <Tab
                key={idx}
                label={tab.title}
                data-qa-tab={tab.title}
                {...tabA11yProps(idx)}
              />
            ))}
          </Tabs>
        </AppBar>
        <div
          className={classNames(
            {
              [classes.panelBody]: !noPadding
            },
            shrinkTabContent
          )}
          data-qa-tab-body
          {...tabPanelA11yProps(value)}
        >
          {render(rest)}
        </div>
      </div>
    </Paper>
  );
};

export default compose<CombinedProps, Props>(React.memo)(TabbedPanel);
