import { UserDefinedField } from 'linode-js-sdk/lib/stackscripts';
import * as React from 'react';
import { compose } from 'recompose';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import LinearProgress from 'src/components/LinearProgress';
import SelectionCard from 'src/components/SelectionCard';
import { APP_ROOT } from 'src/constants';
import { getParamFromUrl } from 'src/utilities/queryParams';
import Panel from './Panel';
import { AppsData } from './types';

type ClassNames = 'flatImagePanelSelections' | 'panel' | 'loading';

const styles = (theme: Theme) =>
  createStyles({
    flatImagePanelSelections: {
      marginTop: theme.spacing(2),
      padding: `${theme.spacing(1)}px 0`
    },
    panel: {
      marginBottom: theme.spacing(3)
    },
    loading: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2)
    }
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
      ? appInstances.find(eachApp => eachApp.id === +appIDFromURL)
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
      openDrawer
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

    return (
      <Panel className={classes.panel} error={error} title="Select App">
        <Grid className={classes.flatImagePanelSelections} container>
          {appInstances.map(eachApp => (
            <SelectionCardWrapper
              key={eachApp.id}
              checked={eachApp.id === selectedStackScriptID}
              label={eachApp.label}
              availableImages={eachApp.images}
              userDefinedFields={eachApp.user_defined_fields}
              handleClick={handleClick}
              openDrawer={openDrawer}
              disabled={disabled}
              id={eachApp.id}
              iconUrl={eachApp.logo_url || ''}
            />
          ))}
        </Grid>
      </Panel>
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

class SelectionCardWrapper extends React.PureComponent<SelectionProps> {
  handleSelectApp = (event: React.SyntheticEvent<HTMLElement, Event>) => {
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

  render() {
    const { iconUrl, id, checked, label, disabled } = this.props;
    /**
     * '' is the default value for a stackscript's logo_url;
     * display a fallback image in this case, to avoid broken image icons
     */

    const renderIcon =
      iconUrl === ''
        ? () => <span className="fl-tux" />
        : () => <img src={`${APP_ROOT}/${iconUrl}`} alt={`${label} logo`} />;

    return (
      <SelectionCard
        key={id}
        checked={checked}
        onClick={this.handleSelectApp}
        onClickInfo={this.handleOpenDrawer}
        renderIcon={renderIcon}
        heading={label}
        subheadings={['']}
        data-qa-selection-card
        disabled={disabled}
        variant="info"
      />
    );
  }
}
