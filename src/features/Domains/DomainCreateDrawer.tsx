import { InjectedNotistackProps, withSnackbar } from 'notistack';
import { Lens, lensPath, over, path, pathOr, set, view } from 'ramda';
import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { bindActionCreators } from 'redux';
import Reload from 'src/assets/icons/reload.svg';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import FormControlLabel from 'src/components/core/FormControlLabel';
import RadioGroup from 'src/components/core/RadioGroup';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import Radio from 'src/components/Radio';
import TagsInput, { Tag } from 'src/components/TagsInput';
import TextField from 'src/components/TextField';
import {
  hasGrant,
  isRestrictedUser
} from 'src/features/Profile/permissionsHelpers';
import { cloneDomain } from 'src/services/domains';
import { ApplicationState } from 'src/store';
import { CLONING, CREATING, resetDrawer } from 'src/store/domainDrawer';
import {
  DomainActionsProps,
  withDomainActions
} from 'src/store/domains/domains.container';
import { getAPIErrorOrDefault, getTagErrors } from 'src/utilities/errorUtils';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

type ClassNames = 'root' | 'masterIPErrorNotice';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  masterIPErrorNotice: {
    marginTop: theme.spacing.unit * 2
  }
});

interface State {
  domain: string;
  type: 'master' | 'slave';
  soaEmail: string;
  cloneName: string;
  tags: Tag[];
  errors?: Linode.ApiFieldError[];
  submitting: boolean;
  master_ips: string[];
  masterIPsCount: number;
}

type CombinedProps = WithStyles<ClassNames> &
  DomainActionsProps &
  DispatchProps &
  RouteComponentProps<{}> &
  StateProps &
  InjectedNotistackProps;

const masterIPsLens = lensPath(['master_ips']);
const masterIPLens = (idx: number) =>
  compose(
    masterIPsLens,
    lensPath([idx])
  ) as Lens;
const viewMasterIP = (idx: number, obj: any) =>
  view<any, string | undefined>(masterIPLens(idx), obj);
const setMasterIP = (idx: number, value: string) =>
  set(masterIPLens(idx), value);

const masterIPsCountLens = lensPath(['masterIPsCount']);
const updateMasterIPsCount = (fn: (s: any) => any) => (obj: any) =>
  over(masterIPsCountLens, fn, obj);

class DomainCreateDrawer extends React.Component<CombinedProps, State> {
  mounted: boolean = false;
  defaultState: State = {
    domain: '',
    type: 'master',
    soaEmail: '',
    cloneName: '',
    tags: [],
    submitting: false,
    errors: [],
    master_ips: [],
    masterIPsCount: 1
  };

  state: State = {
    ...this.defaultState
  };

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidUpdate(prevProps: CombinedProps, prevState: State) {
    if (
      this.props.mode === CLONING &&
      prevState.domain !== (this.props.domain || '')
    ) {
      this.setState({ domain: this.props.domain || '' });
    }
  }

  render() {
    const { classes, open, mode, disabled } = this.props;
    const {
      type,
      domain,
      soaEmail,
      cloneName,
      errors,
      submitting,
      tags
    } = this.state;

    const errorFor = getAPIErrorFor(this.errorResources, errors);

    const generalError = errorFor('none');
    const masterIPsError = errorFor('master_ips');
    const tagError = path<string | undefined>([0], getTagErrors(errors));

    return (
      <Drawer title="Add a new Domain" open={open} onClose={this.closeDrawer}>
        {generalError && !disabled && (
          <Notice error spacingTop={8}>
            {generalError}
          </Notice>
        )}
        {disabled && (
          <Notice
            text={
              "You don't have permissions to create a new Domain. Please, contact an account administrator for details."
            }
            error={true}
            important
          />
        )}
        <RadioGroup
          aria-label="type"
          name="type"
          value={type}
          onChange={this.updateType}
          row
        >
          <FormControlLabel
            value="master"
            label="Master"
            control={<Radio />}
            data-qa-domain-radio="Master"
            disabled={disabled}
          />
          <FormControlLabel
            value="slave"
            label="Slave"
            control={<Radio />}
            data-qa-domain-radio="Slave"
            disabled={disabled}
          />
        </RadioGroup>
        <TextField
          errorText={(mode === CREATING || '') && errorFor('domain')}
          value={domain}
          disabled={mode === CLONING || disabled}
          label="Domain"
          onChange={this.updateLabel}
          data-qa-domain-name
        />
        {mode === CLONING && (
          <TextField
            errorText={errorFor('domain')}
            value={cloneName}
            label="New Domain"
            onChange={this.updateCloneLabel}
            data-qa-clone-name
            disabled={disabled}
          />
        )}
        {mode === CREATING && type === 'master' && (
          <TextField
            errorText={errorFor('soa_email')}
            value={soaEmail}
            label="SOA Email Address"
            onChange={this.updateEmailAddress}
            data-qa-soa-email
            disabled={disabled}
          />
        )}
        {mode === CREATING && type === 'slave' && (
          <React.Fragment>
            {masterIPsError && (
              <Notice
                className={classes.masterIPErrorNotice}
                error
                text={`Master IP addresses must be valid IPv4 addresses.`}
              />
            )}
            {Array.from(Array(this.state.masterIPsCount)).map((slave, idx) => (
              <TextField
                key={idx}
                label="Master Nameserver IP Address"
                InputProps={{ 'aria-label': `ip-address-${idx}` }}
                value={viewMasterIP(idx, this.state) || ''}
                onChange={this.updateMasterIPAddress(idx)}
                data-qa-master-ip={idx}
                disabled={disabled}
              />
            ))}
            <AddNewLink
              onClick={this.addIPField}
              label="Add IP"
              data-qa-add-master-ip-field
              left
              disabled={disabled}
            />
          </React.Fragment>
        )}
        <TagsInput
          value={tags}
          onChange={this.updateTags}
          tagError={tagError}
          disabled={disabled}
        />
        <ActionsPanel>
          {!submitting ? (
            <Button
              type="primary"
              onClick={this.submit}
              data-qa-submit
              disabled={disabled}
            >
              Create
            </Button>
          ) : (
            <Button type="secondary" disabled className="loading">
              <Reload />
            </Button>
          )}
          <Button onClick={this.closeDrawer} type="cancel" data-qa-cancel>
            Cancel
          </Button>
        </ActionsPanel>
      </Drawer>
    );
  }

  errorResources = {
    domain: 'Domain',
    type: 'Type',
    soa_email: 'SOA Email'
  };

  resetInternalState = () => {
    if (this.mounted) {
      this.setState({ ...this.defaultState });
    }
  };

  redirect = (id: number | '') => {
    this.props.history.push(`/domains/${id}`);
  };

  create = () => {
    const { domain, type, soaEmail, master_ips } = this.state;
    const { domainActions } = this.props;
    const tags = this.state.tags.map(tag => tag.value);

    const finalMasterIPs = master_ips.filter(v => v !== '');

    if (type === 'slave' && finalMasterIPs.length === 0) {
      this.setState({
        submitting: false,
        errors: [
          {
            field: 'master_ips',
            reason: 'You must provide at least one Master Nameserver IP Address'
          }
        ]
      });
      return;
    }

    const data =
      type === 'master'
        ? { domain, type, tags, soa_email: soaEmail }
        : { domain, type, tags, master_ips: finalMasterIPs };

    this.setState({ submitting: true });
    domainActions
      .createDomain(data)
      .then((domainData: Linode.Domain) => {
        if (!this.mounted) {
          return;
        }
        this.redirect(domainData.id || '');
        this.closeDrawer();
      })
      .catch(err => {
        if (!this.mounted) {
          return;
        }
        this.setState(
          {
            submitting: false,
            errors: getAPIErrorOrDefault(err)
          },
          () => {
            scrollErrorIntoView();
          }
        );
      });
  };

  clone = () => {
    const { cloneId } = this.props;
    const { cloneName } = this.state;

    if (!cloneId) {
      this.closeDrawer();
      this.props.enqueueSnackbar('Error cloning domain', {
        variant: 'error'
      });
      return;
    }

    this.setState({ submitting: true });
    cloneDomain(cloneId, cloneName)
      .then(data => {
        if (!this.mounted) {
          return;
        }
        this.redirect(data.id || '');
        this.closeDrawer();
      })
      .catch(err => {
        if (!this.mounted) {
          return;
        }
        this.setState(
          {
            submitting: false,
            errors: getAPIErrorOrDefault(err)
          },
          () => {
            scrollErrorIntoView();
          }
        );
      });
  };

  submit = () => {
    if (this.props.mode === CREATING) {
      this.create();
    } else if (this.props.mode === CLONING) {
      this.clone();
    }
  };

  closeDrawer = () => {
    this.resetInternalState();
    this.props.resetDrawer();
  };

  updateLabel = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.setState({ domain: e.target.value });

  updateCloneLabel = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.setState({ cloneName: e.target.value });

  updateEmailAddress = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.setState({ soaEmail: e.target.value });

  updateTags = (selected: Tag[]) => {
    this.setState({ tags: selected });
  };

  updateType = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: 'master' | 'slave'
  ) => this.setState({ type: value });

  updateMasterIPAddress = (idx: number) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => this.setState(setMasterIP(idx, e.target.value));

  addIPField = () => this.setState(updateMasterIPsCount(v => v + 1));
}

const styled = withStyles(styles);

interface DispatchProps {
  resetDrawer: () => void;
}

const mapDispatchToProps = (dispatch: Dispatch<any>) =>
  bindActionCreators({ resetDrawer }, dispatch);

interface StateProps {
  mode: typeof CLONING | typeof CREATING;
  open: boolean;
  domain?: string;
  cloneId?: number;
  disabled: boolean;
}

const mapStateToProps = (state: ApplicationState) => ({
  mode: pathOr(CREATING, ['domainDrawer', 'mode'], state),
  open: pathOr(false, ['domainDrawer', 'open'], state),
  domain: path(['domainDrawer', 'domain'], state),
  cloneId: path(['domainDrawer', 'cloneId'], state),
  // disabled if the profile is restricted and doesn't have add_domains grant
  disabled: isRestrictedUser(state) && !hasGrant(state, 'add_domains')
});

const connected = connect(
  mapStateToProps,
  mapDispatchToProps
);

export default compose<CombinedProps, {}>(
  withDomainActions,
  styled,
  connected,
  withRouter,
  withSnackbar
)(DomainCreateDrawer);
