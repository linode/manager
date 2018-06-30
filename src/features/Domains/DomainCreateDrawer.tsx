import * as React from 'react';

import { pathOr } from 'ramda';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import Drawer from 'src/components/Drawer';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';

import Reload from 'src/assets/icons/reload.svg';

import { sendToast } from 'src/features/ToastNotifications/toasts';
import { cloneDomain, createDomain } from 'src/services/domains';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  open: boolean;
  onClose: (domain?: Partial<Linode.Domain>) => void;
  mode: 'clone' | 'create';
  cloneID?: number;
  domain?: string;
}

interface State {
  domain: string;
  type: 'master' | 'slave';
  soaEmail: string;
  cloneName: string;
  errors?: Linode.ApiFieldError[];
  submitting: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class DomainCreateDrawer extends React.Component<CombinedProps, State> {
  defaultState: State = {
    domain: '',
    type: 'master',
    soaEmail: '',
    cloneName: '',
    submitting: false,
    errors: [],
  };

  state: State = {
    ...this.defaultState,
  };

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.props.mode === 'clone' &&
      prevState.domain !== (this.props.domain || '')) {
      this.setState({ domain: this.props.domain || '' });
    }
  }

  render() {
    const { open, mode } = this.props;
    const { domain, soaEmail, cloneName, errors, submitting } = this.state;

    const errorFor = getAPIErrorFor(this.errorResources, errors);

    const generalError = errorFor('none');

    return (
      <Drawer
        title="Add a new Domain"
        open={open}
        onClose={this.closeDrawer}
      >
        <TextField
          errorText={(mode === 'create' || '') && errorFor('domain')}
          value={domain}
          disabled={mode === 'clone'}
          label="Domain"
          onChange={this.updateLabel}
          data-qa-domain-name
        />
        {mode === 'clone' &&
          <TextField
            errorText={errorFor('domain')}
            value={cloneName}
            label="New Domain"
            onChange={this.updateCloneLabel}
            data-qa-clone-name
          />
        }
        {mode === 'create' &&
          <TextField
            errorText={errorFor('soa_email')}
            value={soaEmail}
            label="SOA Email Address"
            onChange={this.updateEmailAddress}
            data-qa-soa-email
          />
        }
        {generalError &&
          <Notice error>
            generalError
          </Notice>
        }
        <ActionsPanel>
          {!submitting
            ? <Button
              type="primary"
              onClick={this.submit}
              data-qa-submit
            >
              Create
              </Button>
            : <Button
              type="secondary"
              disabled
              className="loading"
            >
              <Reload />
            </Button>
          }
          <Button
            onClick={this.closeDrawer}
            type="cancel"
            data-qa-cancel
          >
            Cancel
          </Button>
        </ActionsPanel>
      </Drawer>
    );
  }

  errorResources = {
    domain: 'Domain',
    type: 'Type',
    soa_email: 'SOA Email',
  };

  reset = () => this.setState({ ...this.defaultState });

  create = () => {
    const { onClose } = this.props;
    const { domain, type, soaEmail } = this.state;
    this.setState({ submitting: true });
    createDomain({
      domain,
      type,
      soa_email: soaEmail,
    })
      .then((res) => {
        this.reset();
        onClose(res.data);
      })
      .catch((err) => {
        this.setState({
          submitting: false,
          errors: pathOr([], ['response', 'data', 'errors'], err),
        }, () => {
          scrollErrorIntoView();
        });
      });
  }

  clone = () => {
    const { onClose, cloneID } = this.props;
    const { cloneName } = this.state;

    if (!cloneID) {
      onClose();
      sendToast('Error cloning domain', 'error');
      return;
    }

    this.setState({ submitting: true });
    cloneDomain(cloneID, cloneName)
      .then((res) => {
        this.reset();
        onClose(res.data);
      })
      .catch((err) => {
        this.setState({
          submitting: false,
          errors: pathOr([], ['response', 'data', 'errors'], err),
        }, () => {
          scrollErrorIntoView();
        });
      });

  }

  submit = () => {
    if (this.props.mode === 'create') {
      this.create();
    } else if (this.props.mode === 'clone') {
      this.clone();
    }
  }

  closeDrawer = () => this.props.onClose();

  updateLabel = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({ domain: e.target.value });

  updateCloneLabel = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({ cloneName: e.target.value })

  updateEmailAddress = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({ soaEmail: e.target.value })
}

const styled = withStyles(styles, { withTheme: true });

export default styled(DomainCreateDrawer);
