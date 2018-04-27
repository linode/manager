import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Button from 'material-ui/Button';

import TextField from 'src/components/TextField';
import Drawer from 'src/components/Drawer';
import ActionsPanel from 'src/components/ActionsPanel';
import { dcDisplayNames } from 'src/constants';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

export interface Props {
  /* from Redux */
  mode: string;
  cloneLabel?: string;
  label?: string;
  size?: number;
  region?: string;
  linodeId?: number;
}

interface State {
  cloneLabel?: string;
  label?: string;
  size?: number;
  region?: string;
  linodeId?: number;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

const modes = {
  CLOSED: 'closed',
  CREATING: 'creating',
  RESIZING: 'resizing',
  CLONING: 'cloning',
  EDITING: 'editing',
};

const titleMap = {
  [modes.CLOSED]: '',
  [modes.CREATING]: 'Create a Volume',
  [modes.RESIZING]: 'Resize a Volume',
  [modes.CLONING]: 'Clone a Volume',
  [modes.EDITING]: 'Rename a Volume',
};

class VolumeDrawer extends React.Component<CombinedProps, State> {
  state: State = {
    cloneLabel: this.props.cloneLabel,
    label: this.props.label,
    size: this.props.size,
    region: this.props.region,
    linodeId: this.props.linodeId,
  };

  componentWillReceiveProps(nextProps: CombinedProps) {
    this.setState({
      cloneLabel: nextProps.cloneLabel,
      label: nextProps.label,
      size: nextProps.size,
      region: nextProps.region,
      linodeId: nextProps.linodeId,
    });
  }

  onClose = () => {
    console.log('Set mode to close');
  }

  render() {
    const { mode } = this.props;

    const {
      cloneLabel,
      label,
      size,
      region,
      linodeId,
      errors,
    } = this.state;

    const hasErrorFor = getAPIErrorFor({}, errors);
    const labelError = hasErrorFor('label');
    const sizeError = hasErrorFor('size');
    const regionError = hasErrorFor('region');
    const linodeError = hasErrorFor('linode_id');

    return (
      <Drawer
        open={mode !== modes.CLOSED}
        onClose={() => this.onClose()}
        title={titleMap[mode]}
      >
        {mode === modes.CLONING &&
          <TextField
            label="Cloned Label"
            value={cloneLabel}
            onChange={e => this.setState({ cloneLabel: (e.target.value) })}
            error={Boolean(labelError)}
            errorText={labelError}
            data-qa-clone-from
          />
        }

        <TextField
          label="Label"
          value={label}
          onChange={e => this.setState({ label: (e.target.value) })}
          error={Boolean(labelError)}
          errorText={labelError}
          disabled={mode === modes.RESIZING || mode === modes.CLONING}
          data-qa-volume-label
        />

        <TextField
          label="Size"
          value={size}
          onChange={e => this.setState({ size: +(e.target.value) })}
          error={Boolean(sizeError)}
          errorText={sizeError}
          disabled={mode === modes.CLONING || mode === modes.EDITING}
          endAdornment="GB"
          data-qa-size
        />

        {/** Needs to be Select */}
        <TextField
          label="Region"
          onChange={e => this.setState({ region: (e.target.value) })}
          value={region && dcDisplayNames[region]}
          error={Boolean(regionError)}
          errorText={regionError}
          disabled={mode === modes.CLONING || mode === modes.RESIZING}
          data-qa-region
          />

        {/** Needs to be Select */}
        <TextField
          label="Attached To"
          {...(onLinodeChange && { onChange: e => onLinodeChange(e.target.value) })}
          value={linodeId}
          error={Boolean(linodeError)}
          errorText={linodeError}
          disabled={disabled && disabled.linode}
          data-qa-attach-to
        />

        <ActionsPanel>
          <Button
            onClick={onSubmit}
            variant="raised"
            color="primary"
            data-qa-submit
          >
            Submit
          </Button>
          <Button
            onClick={onClose}
            variant="raised"
            color="secondary"
            className="cancel"
            data-qa-cancel
          >
            Cancel
          </Button>
        </ActionsPanel>
      </Drawer>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(VolumeDrawer);
