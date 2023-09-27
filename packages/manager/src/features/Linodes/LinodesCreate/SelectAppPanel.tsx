import { UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import { Theme, styled } from '@mui/material/styles';
import * as React from 'react';
import { compose } from 'recompose';

import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { AppPanelSection } from 'src/features/Linodes/LinodesCreate/AppPanelSection';
import { getQueryParamFromQueryString } from 'src/utilities/queryParams';

import { LoadingAppPanelSection } from './LoadingAppPanelSection';
import { Panel } from './Panel';
import { AppsData } from './types';

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

class SelectAppPanel extends React.PureComponent<Props> {
  componentDidMount() {
    this.clickAppIfQueryParamExists();
  }

  componentDidUpdate(prevProps: Props) {
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
        <StyledPanel error={error} title="Select App">
          <ErrorState errorText={appInstancesError} />
        </StyledPanel>
      );
    }

    if (appInstancesLoading || !appInstances) {
      // if (true === true) {
      return (
        <StyledPaper error={error} title="Select App">
          <LoadingAppPanelSection
            desktopCount={3}
            heading="New apps"
            mobileCount={2}
          />
          <LoadingAppPanelSection
            desktopCount={6}
            heading="Popular apps"
            mobileCount={4}
          />
          <LoadingAppPanelSection
            desktopCount={9}
            heading="All apps"
            mobileCount={6}
          />
        </StyledPaper>
      );
    }

    if (!appInstances) {
      return null;
    }

    const newApps = appInstances.filter((app) => {
      return [
        'hashicorp nomad clients cluster',
        'hashicorp nomad cluster',
      ].includes(app.label.toLowerCase().trim());
    });

    const popularApps = appInstances.slice(0, 10);

    // sort mutates original array so make a copy first
    const allApps = [...appInstances].sort((a, b) =>
      a.label.toLowerCase().localeCompare(b.label.toLowerCase())
    );

    const isFilteringOrSearching = isFiltering || isSearching;

    return (
      <StyledPaper data-qa-tp="Select Image">
        {error && <Notice text={error} variant="error" />}
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
      </StyledPaper>
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

const commonStyling = (theme: Theme) => ({
  boxShadow: `${theme.color.boxShadow} 0px -15px 10px -10px inset`,
  height: 450,
  marginBottom: theme.spacing(3),
  overflowY: 'auto' as const,
});

const StyledPanel = styled(Panel, { label: 'StyledPanel' })(({ theme }) => ({
  ...commonStyling(theme),
}));

const StyledPaper = styled(Paper, { label: 'StyledPaper' })(({ theme }) => ({
  ...commonStyling(theme),
}));

export default compose<Props, Props>(React.memo)(SelectAppPanel);
