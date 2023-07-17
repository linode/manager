import { UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import { Theme } from '@mui/material/styles';
import { WithStyles, createStyles, withStyles } from '@mui/styles';
import * as React from 'react';
import { compose } from 'recompose';

import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LandingLoading } from 'src/components/LandingLoading/LandingLoading';
import { Notice } from 'src/components/Notice/Notice';
import Paper from 'src/components/core/Paper';
import AppPanelSection from 'src/features/Linodes/LinodesCreate/AppPanelSection';
import { getQueryParamFromQueryString } from 'src/utilities/queryParams';

import Panel from './Panel';
import { AppsData } from './types';

type ClassNames = 'loading' | 'panel';

const styles = (theme: Theme) =>
  createStyles({
    loading: {
      '& >div:first-of-type': {
        height: 450,
      },
    },
    panel: {
      boxShadow: `${theme.color.boxShadow} 0px -15px 10px -10px inset`,
      height: 450,
      marginBottom: theme.spacing(3),
      overflowY: 'auto',
    },
  });

interface Props extends AppsData {
  disabled: boolean;
  error?: string;
  handleClick: (
    id: number,
    label: string,
    username: string,
    stackScriptImages: string[],
    userDefinedFields: UserDefinedField[]
  ) => void;
  isFiltering: boolean;
  isSearching: boolean;
  openDrawer: (stackScriptLabel: string) => void;
  searchValue?: string;
  selectedStackScriptID?: number;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class SelectAppPanel extends React.PureComponent<CombinedProps> {
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
      appInstances,
      appInstancesError,
      appInstancesLoading,
      classes,
      disabled,
      error,
      handleClick,
      isFiltering,
      isSearching,
      openDrawer,
      searchValue,
      selectedStackScriptID,
    } = this.props;

    if (appInstancesError) {
      return (
        <Panel className={classes.panel} error={error} title="Select App">
          <ErrorState errorText={appInstancesError} />
        </Panel>
      );
    }

    if (appInstancesLoading || !appInstances) {
      return (
        <Panel className={classes.panel} error={error} title="Select App">
          <span className={classes.loading}>
            <LandingLoading />
          </span>
        </Panel>
      );
    }

    if (!appInstances) {
      return null;
    }

    const newApps = appInstances.filter((app) => {
      return ['appwrite', 'illa builder', 'owncloud', 'seatable'].includes(
        app.label.toLowerCase().trim()
      );
    });

    const popularApps = appInstances.slice(0, 10);

    // sort mutates original array so make a copy first
    const allApps = [...appInstances].sort((a, b) =>
      a.label.toLowerCase().localeCompare(b.label.toLowerCase())
    );

    const isFilteringOrSearching = isFiltering || isSearching;

    return (
      <Paper className={classes.panel} data-qa-tp="Select Image">
        {error && <Notice error text={error} />}
        {!isFilteringOrSearching ? (
          <AppPanelSection
            apps={newApps}
            disabled={disabled}
            handleClick={handleClick}
            heading="New apps"
            openDrawer={openDrawer}
            selectedStackScriptID={selectedStackScriptID}
          />
        ) : null}
        {!isFilteringOrSearching ? (
          <AppPanelSection
            apps={popularApps}
            disabled={disabled}
            handleClick={handleClick}
            heading="Popular apps"
            openDrawer={openDrawer}
            selectedStackScriptID={selectedStackScriptID}
          />
        ) : null}
        <AppPanelSection
          apps={allApps}
          disabled={disabled}
          handleClick={handleClick}
          heading={isFilteringOrSearching ? '' : 'All apps'}
          openDrawer={openDrawer}
          searchValue={searchValue}
          selectedStackScriptID={selectedStackScriptID}
        />
      </Paper>
    );
  }

  clickAppIfQueryParamExists = () => {
    const { appInstances, handleClick } = this.props;
    const appIDFromURL = getQueryParamFromQueryString(location.search, 'appID');
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

      // Scroll to app when an app id is passed in the query params
      const section = document.querySelector(`#app-${matchedApp.id}`);
      if (section) {
        section.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'start',
        });
      }

      // If the URL also included &showInfo, open the Info drawer as well
      const showInfo = getQueryParamFromQueryString(
        location.search,
        'showInfo'
      );
      if (showInfo) {
        this.props.openDrawer(matchedApp.label);
      }
    }
  };
}

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(
  styled,
  React.memo
)(SelectAppPanel);
