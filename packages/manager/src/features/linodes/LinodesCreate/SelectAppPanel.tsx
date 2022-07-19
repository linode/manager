import { StackScript, UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import { decode } from 'he';
import * as React from 'react';
import { compose } from 'recompose';
import Info from 'src/assets/icons/info2.svg';
import Divider from 'src/components/core/Divider';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import LinearProgress from 'src/components/LinearProgress';
import Notice from 'src/components/Notice';
import SelectionCard from 'src/components/SelectionCard';
import { APP_ROOT } from 'src/constants';
import { getParamFromUrl } from 'src/utilities/queryParams';
import Panel from './Panel';
import { AppsData } from './types';

type ClassNames =
  | 'flatImagePanelSelections'
  | 'panel'
  | 'loading'
  | 'selectionCard'
  | 'info';

const styles = (theme: Theme) =>
  createStyles({
    flatImagePanelSelections: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(),
      padding: `${theme.spacing(1)}px 0`,
    },
    panel: {
      marginBottom: theme.spacing(3),
      height: 576,
      overflowY: 'auto',
      boxShadow: `${theme.color.boxShadow} 0px 20px 10px -10px`,
    },
    loading: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    selectionCard: {
      '& .cardBaseIcon': {
        width: 40,
        paddingRight: 0,
        justifyContent: 'flex-start',
      },
    },
    info: {
      display: 'flex',
      justifyContent: 'flex-end',
      color: theme.palette.primary.main,
      paddingLeft: 0,
      maxWidth: 40,
      '& svg': {
        width: 19,
        height: 19,
      },
    },
  });

interface Props extends AppsData {
  handleClick: (
    id: number,
    label: string,
    username: string,
    stackScriptImages: string[],
    userDefinedFields: UserDefinedField[]
  ) => void;
  openDrawer: (stackScriptLabel: string) => void;
  disabled: boolean;
  selectedStackScriptID?: number;
  error?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class SelectAppPanel extends React.PureComponent<CombinedProps> {
  clickAppIfQueryParamExists = () => {
    const { handleClick, appInstances } = this.props;
    const appIDFromURL = getParamFromUrl(location.search, 'appID');
    const matchedApp = appInstances
      ? appInstances.find((eachApp) => eachApp.id === +appIDFromURL)
      : undefined;

    if (appIDFromURL && matchedApp) {
      /**
       * check the query params to see if we have an app ID in there and if
       * so pre-select the app
       */
      handleClick(
        matchedApp.id,
        matchedApp.label,
        /**  username is for display purposes only but we're not showing it */
        '',
        matchedApp.images,
        matchedApp.user_defined_fields
      );

      // If the URL also included &showInfo, open the Info drawer as well
      const showInfo = getParamFromUrl(location.search, 'showInfo');
      if (showInfo) {
        this.props.openDrawer(matchedApp.label);
      }
    }
  };

  componentDidMount() {
    this.clickAppIfQueryParamExists();
  }

  componentDidUpdate(prevProps: CombinedProps) {
    if (
      typeof prevProps.appInstances === 'undefined' &&
      typeof this.props.appInstances !== 'undefined'
    ) {
      this.clickAppIfQueryParamExists();
    }
  }

  render() {
    const {
      disabled,
      selectedStackScriptID,
      classes,
      error,
      appInstances,
      appInstancesError,
      appInstancesLoading,
      handleClick,
      openDrawer,
    } = this.props;

    if (appInstancesError) {
      return (
        <Panel className={classes.panel} error={error} title="Select App">
          <ErrorState errorText={appInstancesError} />
        </Panel>
      );
    }

    if (appInstancesLoading) {
      return (
        <Panel className={classes.panel} error={error} title="Select App">
          <LinearProgress className={classes.loading} />
        </Panel>
      );
    }

    if (!appInstances) {
      return null;
    }

    const panelSection = (heading: string, apps: StackScript[]) => (
      <>
        <Typography variant="h2">{heading}</Typography>
        <Divider spacingTop={16} spacingBottom={16} />
        <Grid className={classes.flatImagePanelSelections} container>
          {apps.map((eachApp) => (
            <SelectionCardWrapper
              key={eachApp.id}
              checked={eachApp.id === selectedStackScriptID}
              // Decode App labels since they may contain HTML entities.
              label={decode(eachApp.label)}
              availableImages={eachApp.images}
              userDefinedFields={eachApp.user_defined_fields}
              handleClick={handleClick}
              openDrawer={openDrawer}
              disabled={disabled}
              id={eachApp.id}
              iconUrl={eachApp.logo_url.toLowerCase() || ''}
              classes={classes}
            />
          ))}
        </Grid>
      </>
    );

    const newApps = appInstances.filter((app) => {
      return ['kali linux', 'easypanel', 'liveswitch', 'saltcorn'].includes(
        app.label.toLowerCase().trim()
      );
    });

    const popularApps = appInstances.slice(0, 10);

    return (
      <Paper className={classes.panel} data-qa-tp="Select Image">
        {error && <Notice text={error} error />}
        {panelSection('New apps', newApps)}
        {panelSection('Popular apps', popularApps)}
        {panelSection(
          'All apps',
          appInstances.sort((a, b) =>
            a.label.toLowerCase().localeCompare(b.label.toLowerCase())
          )
        )}
      </Paper>
    );
  }
}

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(
  styled,
  React.memo
)(SelectAppPanel);

interface SelectionProps {
  handleClick: (
    id: number,
    label: string,
    username: string,
    stackScriptImages: string[],
    userDefinedFields: UserDefinedField[]
  ) => void;
  openDrawer: (stackScriptLabel: string) => void;
  iconUrl: string;
  id: number;
  label: string;
  userDefinedFields: UserDefinedField[];
  availableImages: string[];
  disabled: boolean;
  checked: boolean;
}

class SelectionCardWrapper extends React.PureComponent<
  SelectionProps & WithStyles<ClassNames>
> {
  handleSelectApp = () => {
    const { id, label, userDefinedFields, availableImages } = this.props;

    return this.props.handleClick(
      id,
      label,
      '' /** username doesn't matter since we're not displaying it */,
      availableImages,
      userDefinedFields
    );
  };

  handleOpenDrawer = () => {
    const { label, openDrawer } = this.props;
    openDrawer(label);
  };

  handleInfoClick = (e: React.MouseEvent<any>) => {
    e.stopPropagation();
    e.preventDefault();
    this.handleOpenDrawer();
  };

  render() {
    const { iconUrl, id, checked, label, disabled, classes } = this.props;
    /**
     * '' is the default value for a stackscript's logo_url;
     * display a fallback image in this case, to avoid broken image icons
     */

    const renderIcon =
      iconUrl === ''
        ? () => <span className="fl-tux" />
        : () => <img src={`${APP_ROOT}/${iconUrl}`} alt={`${label} logo`} />;

    const renderVariant = () => (
      <Grid item className={classes.info} xs={2}>
        <Info onClick={this.handleInfoClick} />
      </Grid>
    );

    return (
      <SelectionCard
        key={id}
        checked={checked}
        onClick={this.handleSelectApp}
        renderIcon={renderIcon}
        renderVariant={renderVariant}
        heading={label}
        subheadings={['']}
        data-qa-selection-card
        disabled={disabled}
        className={classes.selectionCard}
      />
    );
  }
}
