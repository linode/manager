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

const SelectAppPanel: React.SFC<CombinedProps> = props => {
  const {
    disabled,
    selectedStackScriptID,
    classes,
    error,
    appInstances,
    appInstancesError,
    appInstancesLoading,
    handleClick
  } = props;

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

  /** hacky and bad */
  const interceptedError = error ? 'You must select an App to create from' : '';

  return (
    <Panel
      className={classes.panel}
      error={interceptedError}
      title="Select App"
    >
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
};

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
    return (
      <SelectionCard
        key={id}
        checked={checked}
        onClick={this.handleSelectApp}
        renderIcon={() => {
          return <img src={`${APP_ROOT}/${iconUrl}`} />;
        }}
        heading={label}
        subheadings={['']}
        data-qa-selection-card
        disabled={disabled}
      />
    );
  }
}
