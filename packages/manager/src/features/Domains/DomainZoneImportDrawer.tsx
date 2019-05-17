import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import LinodeTextField from 'src/components/TextField';
import { importZone } from 'src/services/domains';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (domain: Linode.Domain) => void;
}

interface State {
  submitting: boolean;
  errors?: Linode.ApiFieldError[];
  domain?: string;
  remote_nameserver?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class DomainZoneImportDrawer extends React.Component<CombinedProps, State> {
  state: State = {
    submitting: false
  };

  static errorResources = {
    domain: 'domain',
    remote_nameserver: 'remote nameserver'
  };

  render() {
    const { open } = this.props;
    const { submitting, errors } = this.state;
    const hasErrorFor = getAPIErrorsFor(
      DomainZoneImportDrawer.errorResources,
      errors
    );
    const generalError = hasErrorFor('none');
    const domainError = hasErrorFor('domain');
    const remoteNameserverError = hasErrorFor('remote_nameserver');

    const requirementsMet = this.checkRequirements();

    return (
      <Drawer open={open} onClose={this.onClose} title="Import a Zone">
        {generalError && <Notice error text={generalError} />}
        <LinodeTextField
          label="Domain"
          onChange={this.updateDomain}
          errorText={domainError}
        />
        <LinodeTextField
          label="Remote Nameserver"
          onChange={this.updateRemoteNameserver}
          errorText={remoteNameserverError}
        />
        <ActionsPanel>
          <Button
            type="primary"
            loading={submitting}
            onClick={this.onSubmit}
            disabled={!requirementsMet}
          >
            Save
          </Button>
          <Button type="cancel" onClick={this.onClose}>
            Cancel
          </Button>
        </ActionsPanel>
      </Drawer>
    );
  }

  updateRemoteNameserver = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.setState({ remote_nameserver: e.target.value });

  updateDomain = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.setState({ domain: e.target.value });

  reset = () =>
    this.setState({
      submitting: false,
      errors: undefined,
      domain: undefined,
      remote_nameserver: undefined
    });

  onClose = () => {
    const { onClose } = this.props;
    this.reset();
    onClose();
  };

  checkRequirements() {
    return !!this.state.domain && !!this.state.remote_nameserver;
  }

  onSubmit = () => {
    const { domain, remote_nameserver } = this.state;

    // Validate text fields
    const errors = [];
    if (!domain) {
      errors.push({ field: 'domain', reason: 'Domain is required.' });
    }
    if (!remote_nameserver) {
      errors.push({
        field: 'remote_nameserver',
        reason: 'Remote nameserver is required.'
      });
    }
    if (errors.length > 0) {
      this.setState({ errors });
      return;
    }

    this.setState({ submitting: true });

    // Since we've validated test fields, we can assume domain and
    // remote_nameserver won't be undefined
    importZone(domain!, remote_nameserver!)
      .then(data => {
        this.props.onSuccess(data);
      })
      .catch(error => {
        this.setState({
          submitting: false,
          errors: getAPIErrorOrDefault(error)
        });
      });
  };
}

const styled = withStyles(styles);

export default styled(DomainZoneImportDrawer);
