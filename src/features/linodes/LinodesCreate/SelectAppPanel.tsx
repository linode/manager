import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from '@material-ui/core/styles';
import * as React from 'react';
import { compose } from 'recompose';

import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import LinearProgress from 'src/components/LinearProgress';
import SelectionCard from 'src/components/SelectionCard';
import { APP_ROOT } from 'src/constants';
import { getParamFromUrl } from 'src/utilities/queryParams';
import Panel from './Panel';
import { AppsData } from './types';

type ClassNames = 'flatImagePanelSelections' | 'panel' | 'loading';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  flatImagePanelSelections: {
    marginTop: theme.spacing.unit * 2,
    padding: `${theme.spacing.unit}px 0`
  },
  panel: {
    marginBottom: theme.spacing.unit * 3
  },
  loading: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2
  }
});

interface Props extends AppsData {
  handleClick: (
    id: number,
    label: string,
    username: string,
    stackScriptImages: string[],
    userDefinedFields: Linode.StackScript.UserDefinedField[]
  ) => void;
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
      handleClick
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
    userDefinedFields: Linode.StackScript.UserDefinedField[]
  ) => void;
  iconUrl: string;
  id: number;
  label: string;
  userDefinedFields: Linode.StackScript.UserDefinedField[];
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
        renderIcon={renderIcon}
        heading={label}
        subheadings={['']}
        data-qa-selection-card
        disabled={disabled}
      />
    );
  }
}
