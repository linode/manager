import * as React from 'react';
import { pathOr } from 'ramda';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Button from 'material-ui/Button';

import Drawer from 'src/components/Drawer';

import { sendToast } from 'src/features/ToastNotifications/toasts';
import ActionsPanel from 'src/components/ActionsPanel';
import Notice from 'src/components/Notice';
import { createDomain, cloneDomain } from 'src/services/domains';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import Reload from 'src/assets/icons/reload.svg';
import TextField from 'src/components/TextField';

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

  reset() {
    this.setState({ ...this.defaultState });
  }

  create() {
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
        });
      });
  }

  clone() {
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
        });
      });

  }

  submit() {
    if (this.props.mode === 'create') {
      this.create();
    } else if (this.props.mode === 'clone') {
      this.clone();
    }
  }

  errorResources = {
    domain: 'Domain',
    type: 'Type',
    soa_email: 'SOA Email',
  };

  render() {
    const { open, onClose, mode } = this.props;
    const { domain, soaEmail, cloneName, errors, submitting } = this.state;

    const errorFor = getAPIErrorFor(this.errorResources, errors);

    const generalError = errorFor('none');

    return (
      <Drawer
        title="Add a new Domain"
        open={open}
        onClose={() => onClose()}
      >
        <TextField
          errorText={(mode === 'create' || '') && errorFor('domain')}
          value={domain}
          disabled={mode === 'clone'}
          label="Domain"
          onChange={e => this.setState({ domain: e.target.value })}
          data-qa-domain-name
        />
        {mode === 'clone' &&
          <TextField
            errorText={errorFor('domain')}
            value={cloneName}
            label="New Domain"
            onChange={e => this.setState({ cloneName: e.target.value })}
            data-qa-clone-name
          />
        }
        {mode === 'create' &&
          <TextField
            errorText={errorFor('soa_email')}
            value={soaEmail}
            label="SOA Email Address"
            onChange={e => this.setState({ soaEmail: e.target.value })}
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
                variant="raised"
                color="primary"
                onClick={() => this.submit()}
                data-qa-submit
              >
                Create
              </Button>
            : <Button
                variant="raised"
                color="secondary"
                disabled
                className="loading"
              >
                <Reload />
              </Button>
          }
          <Button
            onClick={() => {
              onClose();
            }}
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

export default styled(DomainCreateDrawer);
