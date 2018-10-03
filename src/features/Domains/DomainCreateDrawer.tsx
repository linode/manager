import { compose, Lens, lensPath, over, pathOr, set, view } from 'ramda';
import * as React from 'react';

import FormControlLabel from '@material-ui/core/FormControlLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import Reload from 'src/assets/icons/reload.svg';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import Radio from 'src/components/Radio';
import TextField from 'src/components/TextField';
import { sendToast } from 'src/features/ToastNotifications/toasts';
import { cloneDomain, createDomain } from 'src/services/domains';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

type ClassNames = 'root' | 'masterIPErrorNotice';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  masterIPErrorNotice: {
    marginTop: theme.spacing.unit * 2
  },
});

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (domain?:Linode.Domain) => void;
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
  master_ips: string[];
  masterIPsCount: number;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const masterIPsLens = lensPath(['master_ips']);
const masterIPLens = (idx: number) => compose(masterIPsLens, lensPath([idx])) as Lens;
const viewMasterIP = (idx: number, obj: any) => view<any, string | undefined>(masterIPLens(idx), obj);
const setMasterIP = (idx: number, value: string) => set(masterIPLens(idx), value);

const masterIPsCountLens = lensPath(['masterIPsCount']);
const updateMasterIPsCount = (fn: (s: any) => any) => (obj: any) => over(masterIPsCountLens, fn, obj);

class DomainCreateDrawer extends React.Component<CombinedProps, State> {
  mounted: boolean = false;
  defaultState: State = {
    domain: '',
    type: 'master',
    soaEmail: '',
    cloneName: '',
    submitting: false,
    errors: [],
    master_ips: [],
    masterIPsCount: 1,
  };

  state: State = {
    ...this.defaultState,
  };

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.props.mode === 'clone' &&
      prevState.domain !== (this.props.domain || '')) {
      this.setState({ domain: this.props.domain || '' });
    }
  }

  render() {
    const { classes, open, mode } = this.props;
    const { type, domain, soaEmail, cloneName, errors, submitting } = this.state;

    const errorFor = getAPIErrorFor(this.errorResources, errors);

    const generalError = errorFor('none');
    const masterIPsError = errorFor('master_ips');

    return (
      <Drawer
        title="Add a new Domain"
        open={open}
        onClose={this.closeDrawer}
      >
        {generalError &&
          <Notice error spacingTop={8}>
            {generalError}
          </Notice>
        }
        <RadioGroup
          aria-label="type"
          name="type"
          value={type}
          onChange={this.updateType}
          row
        >
          <FormControlLabel value="master" label="Master" control={<Radio />} />
          <FormControlLabel value="slave" label="Slave" control={<Radio />} />
        </RadioGroup>

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
        {mode === 'create' && type === 'master' &&
          <TextField
            errorText={errorFor('soa_email')}
            value={soaEmail}
            label="SOA Email Address"
            onChange={this.updateEmailAddress}
            data-qa-soa-email
          />
        }
        {mode === 'create' && type === 'slave' &&
          <React.Fragment>
            {masterIPsError && <Notice className={classes.masterIPErrorNotice} error text={`Master IP addresses must be valid IPv4 addresses.`} />}
            {
              Array.from(Array(this.state.masterIPsCount)).map((slave, idx) => (
                <TextField
                  key={idx}
                  label="Master Nameserver IP Address"
                  InputProps={{ "aria-label": `ip-address-${idx}` }}
                  value={viewMasterIP(idx, this.state) || ''}
                  onChange={this.updateMasterIPAddress(idx)}
                  data-qa-master-ip={idx}
                />
              ))
            }
            <AddNewLink
              onClick={this.addIPField}
              label="Add IP"
              data-qa-add-master-ip-field
              left
            />
          </React.Fragment>
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

  reset = () => {
    if (this.mounted) { this.setState({ ...this.defaultState }); }
  }

  create = () => {
    const { onSuccess } = this.props;
    const { domain, type, soaEmail, master_ips } = this.state;

    const finalMasterIPs = master_ips.filter(v => v !== '');

    if (type === 'slave' && finalMasterIPs.length === 0) {
      this.setState({
        submitting: false,
        errors: [
          {
            field: 'master_ips',
            reason: 'You must provide at least one Master Nameserver IP Address'
          }
        ],
      });
      return;
    }

    const data = type === 'master'
      ? { domain, type, soa_email: soaEmail }
      : { domain, type, master_ips: finalMasterIPs }

    this.setState({ submitting: true });
    createDomain(data)
      .then((res) => {
        if (!this.mounted) { return; }
        this.reset();
        onSuccess(res.data);
      })
      .catch((err) => {
        if (!this.mounted) { return; }
        this.setState({
          submitting: false,
          errors: pathOr([], ['response', 'data', 'errors'], err),
        }, () => {
          scrollErrorIntoView();
        });
      });
  }

  clone = () => {
    const { onClose, onSuccess, cloneID } = this.props;
    const { cloneName } = this.state;

    if (!cloneID) {
      onClose();
      sendToast('Error cloning domain', 'error');
      return;
    }

    this.setState({ submitting: true });
    cloneDomain(cloneID, cloneName)
      .then((res) => {
        if (!this.mounted) { return; }
        this.reset();
        onSuccess(res.data)
      })
      .catch((err) => {
        if (!this.mounted) { return; }
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

  closeDrawer = () => {
    this.reset();
    this.props.onClose();
  }

  updateLabel = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.setState({ domain: e.target.value });

  updateCloneLabel = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.setState({ cloneName: e.target.value })

  updateEmailAddress = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.setState({ soaEmail: e.target.value })

  updateType = (e: React.ChangeEvent<HTMLInputElement>, value: 'master' | 'slave') =>
    this.setState({ type: value })

  updateMasterIPAddress = (idx: number) => (e: React.ChangeEvent<HTMLInputElement>) =>
    this.setState(setMasterIP(idx, e.target.value))

  addIPField = () => this.setState(updateMasterIPsCount(v => v + 1))
}

const styled = withStyles(styles, { withTheme: true });

export default styled(DomainCreateDrawer);
