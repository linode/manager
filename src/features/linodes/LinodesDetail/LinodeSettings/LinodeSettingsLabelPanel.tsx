import * as React from 'react';
import { compose, lensPath, set } from 'ramda';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from '@material-ui/core/styles';

import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import { updateLinode } from 'src/services/linodes';

import Button from 'src/components/Button';
import ExpansionPanel from 'src/components/ExpansionPanel';
import ActionsPanel from 'src/components/ActionsPanel';
import TextField from 'src/components/TextField';
import PanelErrorBoundary from 'src/components/PanelErrorBoundary';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { withLinode } from 'src/features/linodes/LinodesDetail/context';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props { }

interface ContextProps {
  linodeLabel: string;
  linodeId: number;
  updateLinode: (f: (t: Linode.Linode) => Linode.Linode) => void;
}

interface State {
  initialValue: string;
  updatedValue: string;
  submitting: boolean;
  success?: string;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props & ContextProps & WithStyles<ClassNames>;

class LinodeSettingsLabelPanel extends React.Component<CombinedProps, State> {
  state: State = {
    initialValue: this.props.linodeLabel,
    updatedValue: this.props.linodeLabel,
    submitting: false,
  };

  changeLabel = () => {
    this.setState(set(lensPath(['submitting']), true));
    this.setState(set(lensPath(['success']), undefined));
    this.setState(set(lensPath(['errors']), undefined));

    updateLinode(this.props.linodeId, { label: this.state.updatedValue })
      .then(response => response.data)
      .then((linode) => {
        this.props.updateLinode((existingLinode) => ({
          ...existingLinode,
          ...linode,
        }));

        this.setState(compose(
          set(lensPath(['success']), `Linode label changed successfully.`),
          set(lensPath(['submitting']), false),
        ));
      })
      .catch((error) => {
        this.setState(set(lensPath(['errors']), error.response.data.errors), () => {
          scrollErrorIntoView('linode-settings-label');
        });
      });
  }

  render() {
    const hasErrorFor = getAPIErrorFor({}, this.state.errors);
    const labelError = hasErrorFor('label');
    const { submitting } = this.state;

    return (
      <ExpansionPanel
        defaultExpanded
        heading="Linode Label"
        success={this.state.success}
        actions={() =>
          <ActionsPanel>
            <Button
              onClick={this.changeLabel}
              type="primary"
              disabled={submitting && !labelError}
              loading={submitting && !labelError}
              data-qa-label-save
            >
              Save
            </Button>
          </ActionsPanel>
        }
      >
        <TextField
          label="Label"
          value={this.state.updatedValue}
          onChange={e =>
            this.setState(set(lensPath(['updatedValue']), e.target.value))}
          errorText={labelError}
          errorGroup="linode-settings-label"
          error={Boolean(labelError)}
          data-qa-label
        />
      </ExpansionPanel>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

const errorBoundary = PanelErrorBoundary({ heading: 'Linode Label' });

const linodeContext = withLinode((context) => ({
  linodeId: context.data!.id,
  linodeLabel: context.data!.label,
  updateLinode: context.update,
}));

export default compose(
  errorBoundary,
  styled,
 linodeContext
)(LinodeSettingsLabelPanel) as React.ComponentType<Props>;
