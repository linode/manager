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

import ActionsPanel from 'src/components/ActionsPanel';
import Notice from 'src/components/Notice';
import { createDomain } from 'src/services/domains';
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
}

interface State {
  domain: string;
  type: 'master' | 'slave';
  soaEmail: string;
  errors?: Linode.ApiFieldError[];
  submitting: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class DomainCreateDrawer extends React.Component<CombinedProps, State> {
  defaultState: State = {
    domain: '',
    type: 'master',
    soaEmail: '',
    submitting: false,
    errors: [],
  };

  state: State = {
    ...this.defaultState,
  };

  reset() {
    this.setState({ ...this.defaultState });
  }

  errorResources = {
    domain: 'Domain',
    type: 'Type',
    soa_email: 'SOA Email',
  };

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

  render() {
    const { open, onClose } = this.props;
    const { domain, soaEmail, errors, submitting } = this.state;

    const errorFor = getAPIErrorFor(this.errorResources, errors);

    const generalError = errorFor('none');

    return (
      <Drawer
        title="Add a new Domain"
        open={open}
        onClose={() => onClose()}
      >
        <TextField
          errorText={errorFor('domain')}
          value={domain}
          label="Domain"
          onChange={e => this.setState({ domain: e.target.value })}
        />
        <TextField
          errorText={errorFor('soa_email')}
          value={soaEmail}
          label="SOA Email Address"
          onChange={e => this.setState({ soaEmail: e.target.value })}
        />
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
                onClick={() => this.create()}
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
          <Button onClick={() => {
            onClose();
          }}>
            Cancel
          </Button>
        </ActionsPanel>
      </Drawer>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(DomainCreateDrawer);
