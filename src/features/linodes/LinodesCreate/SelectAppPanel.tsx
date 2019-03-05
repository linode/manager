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
import Panel from './Panel';

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

interface Props {
  stackScripts?: Linode.StackScript.Response[];
  stackScriptsLoading: boolean;
  stackScriptsError?: string;
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
    stackScripts,
    stackScriptsError,
    stackScriptsLoading,
    handleClick
  } = props;

  if (stackScriptsError) {
    return (
      <Panel className={classes.panel} error={error} title="Select App">
        <ErrorState errorText={stackScriptsError} />
      </Panel>
    );
  }

  if (stackScriptsLoading) {
    return (
      <Panel className={classes.panel} error={error} title="Select App">
        <LinearProgress className={classes.loading} />
      </Panel>
    );
  }

  if (!stackScripts) {
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
        {stackScripts.map(eachStackScript => (
          <SelectionCardWrapper
            key={eachStackScript.id}
            checked={eachStackScript.id === selectedStackScriptID}
            username={eachStackScript.username}
            label={eachStackScript.label}
            availableImages={eachStackScript.images}
            userDefinedFields={eachStackScript.user_defined_fields}
            handleClick={handleClick}
            disabled={disabled}
            id={eachStackScript.id}
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
  id: number;
  label: string;
  username: string;
  userDefinedFields: Linode.StackScript.UserDefinedField[];
  availableImages: string[];
  disabled: boolean;
  checked: boolean;
}

class SelectionCardWrapper extends React.PureComponent<SelectionProps> {
  handleSelectApp = (event: React.SyntheticEvent<HTMLElement, Event>) => {
    const {
      id,
      label,
      username,
      userDefinedFields,
      availableImages
    } = this.props;

    return this.props.handleClick(
      id,
      label,
      username,
      availableImages,
      userDefinedFields
    );
  };

  render() {
    const { id, checked, label, disabled } = this.props;
    return (
      <SelectionCard
        key={id}
        checked={checked}
        onClick={this.handleSelectApp}
        renderIcon={() => {
          return <span className={`fl-coreos`} />;
        }}
        heading={label}
        subheadings={['']}
        data-qa-selection-card
        disabled={disabled}
      />
    );
  }
}
