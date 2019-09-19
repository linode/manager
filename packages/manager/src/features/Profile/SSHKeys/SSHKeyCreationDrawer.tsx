import { createSSHKey } from 'linode-js-sdk/lib/profile';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

interface Props {
  open: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

interface State {
  submitting: boolean;
  errors?: Linode.ApiFieldError[];
  label: string;
  sshKey: string;
}

type CombinedProps = Props;

export class SSHKeyCreationDrawer extends React.PureComponent<
  CombinedProps,
  State
> {
  state: State = {
    submitting: false,
    label: '',
    sshKey: ''
  };

  componentDidUpdate(prevProps: CombinedProps) {
    /** Reset the form when opening. */
    if (!prevProps.open && this.props.open) {
      this.setState({
        submitting: false,
        errors: undefined,
        label: '',
        sshKey: ''
      });
    }
  }

  render() {
    const { errors } = this.state;
    const hasErrorFor = getAPIErrorFor(
      {
        label: 'Label',
        ssh_key: 'Public key'
      },
      errors
    );
    const generalError = hasErrorFor('none');

    return (
      <Drawer
        open={this.props.open}
        title={`Add SSH Key`}
        onClose={this.props.onCancel}
      >
        {generalError && <Notice error text={generalError} />}

        <TextField
          errorText={hasErrorFor('label')}
          label="Label"
          onChange={this.handleLabelChange}
          value={this.state.label}
          data-qa-label-field
        />

        <TextField
          errorText={hasErrorFor('ssh_key')}
          label="SSH Public Key"
          onChange={this.handleKeyChange}
          value={this.state.sshKey}
          data-qa-ssh-key-field
          multiline
          rows={10}
        />

        <ActionsPanel>
          <Button
            data-qa-submit
            buttonType="primary"
            loading={this.state.submitting}
            onClick={this.onSubmit}
          >
            Add Key
          </Button>
          <Button
            data-qa-cancel
            buttonType="cancel"
            onClick={this.props.onCancel}
          >
            Cancel
          </Button>
        </ActionsPanel>
      </Drawer>
    );
  }

  onSubmit = () => {
    const { label, sshKey } = this.state;

    const errors: Linode.ApiFieldError[] = [];

    if (label === '') {
      errors.push({ field: 'label', reason: 'Label cannot be blank.' });
    }

    if (sshKey === '') {
      errors.push({ field: 'ssh_key', reason: 'Public key cannot be blank.' });
    }

    if (errors.length > 0) {
      return this.setState({ errors });
    }

    this.setState({ submitting: true });

    createSSHKey({ label, ssh_key: sshKey })
      .then(_ => {
        this.setState({ submitting: false });
        this.props.onSuccess();
      })
      .catch(error => {
        this.setState({
          errors: getAPIErrorOrDefault(
            error,
            'Unable to save SSH key. Please try again.'
          ),
          submitting: false
        });
      });
  };

  handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ label: e.target.value || '' });
  };

  handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ sshKey: e.target.value.trim() || '' });
  };
}

export default SSHKeyCreationDrawer;
