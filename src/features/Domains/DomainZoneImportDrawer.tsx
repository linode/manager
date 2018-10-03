import { pathOr } from 'ramda';
import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import LinodeTextField from 'src/components/TextField';
import { importZone } from 'src/services/domains';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (domain:Linode.Domain) => void;
}

interface State {
  submitting: boolean;
  errors?: Linode.ApiFieldError[];
  domain?: string
  remote_nameserver?: string
}

type CombinedProps = Props & WithStyles<ClassNames>;

class DomainZoneImportDrawer extends React.Component<CombinedProps, State> {
  state: State = {
    submitting: false,
  };

  static errorResources = {
    domain: 'domain',
    remote_nameserver: 'remote nameserver',
  };

  render() {
    const { open } = this.props;
    const { submitting, errors } = this.state;
    const hasErrorFor = getAPIErrorsFor(DomainZoneImportDrawer.errorResources, errors);
    const generalError = hasErrorFor('none');
    const domainError = hasErrorFor('domain');
    const remoteNameserverError = hasErrorFor('remote_nameserver');

    return (
      <Drawer
        open={open}
        onClose={this.onClose}
        title="Import a Zone"
      >
        {generalError && <Notice error text={generalError} />}
        <LinodeTextField label="Domain" onChange={this.updateDomain} errorText={domainError} />
        <LinodeTextField label="Remote Nameserver" onChange={this.updateRemoteNameserver} errorText={remoteNameserverError} />
        <ActionsPanel>
          <Button type="primary" loading={submitting} onClick={this.onSubmit}>Save</Button>
          <Button type="cancel" onClick={this.onClose}>Cancel</Button>
        </ActionsPanel>
      </Drawer>
    );
  }

  updateRemoteNameserver = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({ remote_nameserver: e.target.value });

  updateDomain = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({ domain: e.target.value });

  reset = () => this.setState({
    submitting: false,
    errors: undefined,
    domain: undefined,
    remote_nameserver: undefined,
  });

  onClose = () => {
    const { onClose } = this.props;
    this.reset();
    onClose();
  };

  onSubmit = () => {
    const { domain, remote_nameserver } = this.state;

    this.setState({ submitting: true });

    importZone(domain, remote_nameserver)
      .then((response) => {
        this.props.onSuccess(response.data);
      })
      .catch((error:Linode.ApiFieldError) => {
        const err: Linode.ApiFieldError[] = [{ field: 'none', reason: 'An unexpected error has ocurred.' }];

        this.setState({
          submitting: false,
          errors: pathOr(err, ['response', 'data', 'errors'], error),
        })
      });
  };
}

const styled = withStyles(styles, { withTheme: true });

export default styled(DomainZoneImportDrawer);
