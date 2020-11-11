import { GrantLevel } from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import { lensPath, pathOr, set } from 'ramda';
import * as React from 'react';
import { compose as recompose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Accordion from 'src/components/Accordion';
import Notice from 'src/components/Notice';
import PanelErrorBoundary from 'src/components/PanelErrorBoundary';
import TextField from 'src/components/TextField';
import {
  UpdateLinode,
  withLinodeDetailContext
} from 'src/features/linodes/LinodesDetail/linodeDetailContext';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

interface State {
  initialValue: string;
  updatedValue: string;
  submitting: boolean;
  success?: string;
  errors?: APIError[];
}

type CombinedProps = ContextProps;

class LinodeSettingsLabelPanel extends React.Component<CombinedProps, State> {
  state: State = {
    initialValue: this.props.linodeLabel,
    updatedValue: this.props.linodeLabel,
    submitting: false
  };

  changeLabel = () => {
    const { updateLinode } = this.props;
    this.setState({
      submitting: true,
      success: undefined,
      errors: undefined
    });

    updateLinode({ label: this.state.updatedValue })
      .then(linode => {
        this.setState({
          success: 'Linode label changed successfully.',
          submitting: false
        });
      })
      .catch(error => {
        this.setState(
          {
            submitting: false,
            errors: getAPIErrorOrDefault(
              error,
              'An error occured while updating label'
            )
          },
          () => {
            scrollErrorIntoView('linode-settings-label');
          }
        );
      });
  };

  render() {
    const hasErrorFor = getAPIErrorFor({}, this.state.errors);
    const labelError = hasErrorFor('label');
    const { submitting } = this.state;
    const { permissions } = this.props;
    const disabled = permissions === 'read_only';
    const genericError =
      this.state.errors &&
      !labelError &&
      pathOr(
        'An error occured while updating label',
        [0, 'reason'],
        this.state.errors
      );

    return (
      <Accordion
        heading="Linode Label"
        success={this.state.success}
        actions={() => (
          <ActionsPanel>
            <Button
              onClick={this.changeLabel}
              buttonType="primary"
              disabled={disabled || (submitting && !labelError)}
              loading={submitting && !labelError}
              data-qa-label-save
            >
              Save
            </Button>
          </ActionsPanel>
        )}
      >
        {genericError && <Notice error text={genericError} />}
        <TextField
          label="Label"
          value={this.state.updatedValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            this.setState(set(lensPath(['updatedValue']), e.target.value))
          }
          errorText={labelError}
          errorGroup="linode-settings-label"
          error={Boolean(labelError)}
          data-qa-label
          disabled={disabled}
        />
      </Accordion>
    );
  }
}

const errorBoundary = PanelErrorBoundary({ heading: 'Linode Label' });

interface ContextProps {
  linodeLabel: string;
  updateLinode: UpdateLinode;
  permissions: GrantLevel;
}

const linodeContext = withLinodeDetailContext<ContextProps>(
  ({ linode, updateLinode }) => ({
    linodeLabel: linode.label,
    permissions: linode._permissions,
    updateLinode
  })
);

export default recompose<CombinedProps, {}>(
  errorBoundary,
  linodeContext
)(LinodeSettingsLabelPanel) as React.ComponentType<{}>;
