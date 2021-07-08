import {
  cloneDomain,
  createDomainRecord,
  Domain,
} from '@linode/api-v4/lib/domains';
import { Linode } from '@linode/api-v4/lib/linodes';
import { NodeBalancer } from '@linode/api-v4/lib/nodebalancers';
import { APIError } from '@linode/api-v4/lib/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { path } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { bindActionCreators, Dispatch } from 'redux';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Divider from 'src/components/core/Divider';
import FormControlLabel from 'src/components/core/FormControlLabel';
import RadioGroup from 'src/components/core/RadioGroup';
import Drawer from 'src/components/Drawer';
import MultipleIPInput from 'src/components/MultipleIPInput';
import Notice from 'src/components/Notice';
import Radio from 'src/components/Radio';
import TagsInput, { Tag } from 'src/components/TagsInput';
import TextField from 'src/components/TextField';
import {
  hasGrant,
  isRestrictedUser,
} from 'src/features/Profile/permissionsHelpers';
import { ApplicationState } from 'src/store';
import {
  CLONING,
  EDITING,
  Origin as DomainDrawerOrigin,
  resetDrawer,
} from 'src/store/domainDrawer';
import { upsertDomain } from 'src/store/domains/domains.actions';
import {
  DomainActionsProps,
  withDomainActions,
} from 'src/store/domains/domains.container';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';
import {
  ExtendedIP,
  extendedIPToString,
  stringToExtendedIP,
} from 'src/utilities/ipUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import DeleteDomain from './DeleteDomain';
import { getInitialIPs, transferHelperText as helperText } from './domainUtils';

type DefaultRecordsType = 'none' | 'linode' | 'nodebalancer';

interface State {
  domain: string;
  type: 'master' | 'slave';
  soaEmail: string;
  cloneName: string;
  tags: Tag[];
  errors?: APIError[];
  submitting: boolean;
  master_ips: string[];
  axfr_ips: string[];
  defaultRecordsSetting: DefaultRecordsType;
  selectedDefaultLinode?: Linode;
  selectedDefaultNodeBalancer?: NodeBalancer;
}

type CombinedProps = DomainActionsProps &
  DispatchProps &
  RouteComponentProps<{}> &
  StateProps &
  WithSnackbarProps;

export const generateDefaultDomainRecords = (
  domain: string,
  domainID: number,
  ipv4?: string,
  ipv6?: string | null
) => {
  /**
   * At this point, the IPv6 is including the prefix and we need to strip that
   *
   * BUT
   *
   * this logic only applies to Linodes' ipv6, not NodeBalancers. No stripping
   * needed for NodeBalancers.
   */
  const cleanedIPv6 =
    ipv6 && ipv6.includes('/') ? ipv6.substr(0, ipv6.indexOf('/')) : ipv6;

  const baseIPv4Requests = [
    createDomainRecord(domainID, {
      type: 'A',
      target: ipv4,
    }),
    createDomainRecord(domainID, {
      type: 'A',
      target: ipv4,
      name: 'www',
    }),
    createDomainRecord(domainID, {
      type: 'A',
      target: ipv4,
      name: 'mail',
    }),
  ];

  return Promise.all(
    /** ipv6 can be null so don't try to create domain records in that case */
    !!cleanedIPv6
      ? [
          ...baseIPv4Requests,
          createDomainRecord(domainID, {
            type: 'AAAA',
            target: cleanedIPv6,
          }),
          createDomainRecord(domainID, {
            type: 'AAAA',
            target: cleanedIPv6,
            name: 'www',
          }),
          createDomainRecord(domainID, {
            type: 'AAAA',
            target: cleanedIPv6,
            name: 'mail',
          }),
          createDomainRecord(domainID, {
            type: 'MX',
            priority: 10,
            target: `mail.${domain}`,
          }),
        ]
      : baseIPv4Requests
  );
};

class DomainDrawer extends React.Component<CombinedProps, State> {
  mounted: boolean = false;
  defaultState: State = {
    domain: '',
    type: 'master',
    soaEmail: '',
    cloneName: '',
    tags: [],
    submitting: false,
    errors: [],
    master_ips: [''],
    axfr_ips: [''],
    defaultRecordsSetting: 'none',
    selectedDefaultLinode: undefined,
    selectedDefaultNodeBalancer: undefined,
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

  componentDidUpdate(prevProps: CombinedProps, prevState: State) {
    if (
      this.props.mode === CLONING &&
      prevState.domain !== (this.props.domain || '')
    ) {
      this.setState({ domain: this.props.domain || '' });
    }

    if (
      this.props.domainProps && // There are domain props for an update and ...
      (!prevProps.domainProps || // it just appeared
        prevProps.domainProps.id !== this.props.domainProps.id)
    ) {
      // or the domain for editing has changed
      // then put it props into state to populate fields
      const {
        axfr_ips,
        domain,
        tags,
        master_ips,
        type,
        soa_email,
      } = this.props.domainProps;
      this.setState({
        tags: tags.map((tag) => ({ label: tag, value: tag })),
        type,
        domain,
        master_ips: getInitialIPs(master_ips),
        axfr_ips: getInitialIPs(axfr_ips),
        soaEmail: soa_email,
      });
    }
  }

  render() {
    const { open, mode, disabled } = this.props;
    const {
      type,
      domain,
      soaEmail,
      cloneName,
      errors,
      submitting,
      tags,
    } = this.state;

    const errorMap = getErrorMap(
      [
        'axfr_ips',
        'master_ips',
        'domain',
        'type',
        'soa_email',
        'tags',
        'defaultNodeBalancer',
        'defaultLinode',
      ],
      errors
    );

    const generalError = errorMap.none;
    const primaryIPsError = errorMap.master_ips;

    const title = mode === EDITING ? 'Edit Domain' : 'Clone Domain';

    const isEditingPrimaryDomain = mode === EDITING && type === 'master';
    const isEditingSecondaryDomain = mode === EDITING && type === 'slave';

    return (
      <Drawer title={title} open={open} onClose={this.closeDrawer}>
        {generalError && !disabled && (
          <Notice error spacingTop={8}>
            {generalError}
          </Notice>
        )}
        {disabled && (
          <Notice
            text={
              "You don't have permissions to create a new Domain. Please contact an account administrator for details."
            }
            error
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
            label="Primary"
            control={<Radio />}
            data-qa-domain-radio="Primary"
            disabled={mode === EDITING || mode === CLONING || disabled}
          />
          <FormControlLabel
            value="slave"
            label="Secondary"
            control={<Radio />}
            data-qa-domain-radio="Secondary"
            disabled={mode === EDITING || mode === CLONING || disabled}
          />
        </RadioGroup>
        <TextField
          errorText={(mode === EDITING || '') && errorMap.domain}
          value={domain}
          disabled={mode === CLONING || disabled}
          label="Domain"
          onChange={this.updateLabel}
          data-qa-domain-name
          data-testid="domain-name-input"
        />
        {mode === CLONING && (
          <TextField
            errorText={errorMap.domain}
            value={cloneName}
            label="New Domain"
            onChange={this.updateCloneLabel}
            data-qa-clone-name
            disabled={disabled}
          />
        )}
        {isEditingPrimaryDomain && (
          <TextField
            errorText={errorMap.soa_email}
            value={soaEmail}
            label="SOA Email Address"
            onChange={this.updateEmailAddress}
            data-qa-soa-email
            data-testid="soa-email-input"
            disabled={disabled}
          />
        )}
        {isEditingSecondaryDomain && (
          <React.Fragment>
            <MultipleIPInput
              title="Primary Nameserver IP Address"
              ips={this.state.master_ips.map(stringToExtendedIP)}
              onChange={this.updatePrimaryIPAddress}
              error={primaryIPsError}
            />
            {isEditingSecondaryDomain && (
              // Only when editing
              <MultipleIPInput
                title="Domain Transfer IPs"
                helperText={helperText}
                ips={this.state.axfr_ips.map(stringToExtendedIP)}
                onChange={this.handleTransferInput}
                error={errorMap.axfr_ips}
              />
            )}
          </React.Fragment>
        )}
        {this.props.mode !== CLONING && (
          <TagsInput
            value={tags}
            onChange={this.updateTags}
            tagError={errorMap.tags}
            disabled={disabled}
          />
        )}
        <ActionsPanel>
          <Button
            buttonType="primary"
            onClick={this.submit}
            disabled={disabled}
            loading={submitting}
            data-qa-submit
            data-testid="create-domain-submit"
          >
            {mode === EDITING ? 'Save Changes' : 'Create Domain'}
          </Button>
          <Button
            buttonType="secondary"
            onClick={this.closeDrawer}
            data-qa-cancel
          >
            Cancel
          </Button>
        </ActionsPanel>
        {mode === EDITING && this.props.id && this.props.domain && (
          <>
            <Divider spacingTop={28} spacingBottom={22} />
            <DeleteDomain
              domainId={this.props.id}
              domainLabel={this.props.domain}
              onSuccess={this.closeDrawer}
            />
          </>
        )}
      </Drawer>
    );
  }

  handleTransferInput = (newIPs: ExtendedIP[]) => {
    const axfr_ips = newIPs.length > 0 ? newIPs.map(extendedIPToString) : [''];
    if (this.mounted) {
      this.setState({ axfr_ips });
    }
  };

  resetInternalState = () => {
    if (this.mounted) {
      this.setState({ ...this.defaultState });
    }
  };

  redirect = (id: number | '', state?: Record<string, string>) => {
    const returnPath = !!id ? `/domains/${id}` : '/domains';
    this.props.history.push(returnPath, state);
  };

  redirectToLandingOrDetail = (
    type: 'master' | 'slave',
    domainID: number,
    state: Record<string, string> = {}
  ) => {
    if (type === 'master' && domainID) {
      this.redirect(domainID, state);
    } else {
      this.redirect('', state);
    }
    this.closeDrawer();
  };

  clone = () => {
    const { id } = this.props;
    const { cloneName } = this.state;

    if (!id) {
      this.closeDrawer();
      this.props.enqueueSnackbar('Error cloning domain', {
        variant: 'error',
      });
      return;
    }

    this.setState({ submitting: true });
    cloneDomain(id, cloneName)
      .then((data) => {
        if (!this.mounted) {
          return;
        }
        this.props.upsertDomain(data);
        this.redirect(data.id || '');
        this.closeDrawer();
      })
      .catch((err) => {
        if (!this.mounted) {
          return;
        }
        this.setState(
          {
            submitting: false,
            errors: getAPIErrorOrDefault(err),
          },
          () => {
            scrollErrorIntoView();
          }
        );
      });
  };

  update = () => {
    const { axfr_ips, domain, type, soaEmail, master_ips } = this.state;
    const { domainActions, id } = this.props;
    const tags = this.state.tags.map((tag) => tag.value);

    if (!id) {
      // Weird case if the id was not passed
      this.closeDrawer();
      return;
    }

    const primaryIPs = master_ips.filter((v) => v !== '');
    const finalTransferIPs = axfr_ips.filter((v) => v !== '');

    if (type === 'slave' && primaryIPs.length === 0) {
      this.setState({
        submitting: false,
        errors: [
          {
            field: 'master_ips',
            reason:
              'You must provide at least one Primary Nameserver IP Address',
          },
        ],
      });
      return;
    }

    const data =
      type === 'master'
        ? // Not sending type for master. There is a bug on server and it returns an error that `master_ips` is required
          { domain, tags, soa_email: soaEmail, domainId: id }
        : {
            domain,
            type,
            tags,
            master_ips: primaryIPs,
            domainId: id,
            axfr_ips: finalTransferIPs,
          };

    this.setState({ submitting: true });
    domainActions
      .updateDomain(data)
      .then((_) => {
        if (!this.mounted) {
          return;
        }
        this.closeDrawer();
      })
      .catch((err) => {
        if (!this.mounted) {
          return;
        }
        this.setState(
          {
            submitting: false,
            errors: getAPIErrorOrDefault(err),
          },
          () => {
            scrollErrorIntoView();
          }
        );
      });
  };

  submit = () => {
    if (this.props.mode === CLONING) {
      this.clone();
    } else if (this.props.mode === EDITING) {
      this.update();
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

  updatePrimaryIPAddress = (newIPs: ExtendedIP[]) => {
    const master_ips =
      newIPs.length > 0 ? newIPs.map(extendedIPToString) : [''];
    if (this.mounted) {
      this.setState({ master_ips });
    }
  };
}

interface DispatchProps {
  resetDrawer: () => void;
  upsertDomain: (domain: Domain) => void;
}

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators({ resetDrawer, upsertDomain }, dispatch);

interface StateProps {
  mode: typeof CLONING | typeof EDITING;
  open: boolean;
  domain?: string;
  domainProps?: Domain;
  id?: number;
  disabled: boolean;
  origin: DomainDrawerOrigin;
}

const mapStateToProps = (state: ApplicationState) => {
  const id = state.domainDrawer?.id ?? '0';
  const domainEntities = state.__resources.domains.itemsById;
  const domainProps = domainEntities[String(id)];
  return {
    mode: state.domainDrawer?.mode,
    open: state.domainDrawer?.open ?? false,
    domain: path(['domainDrawer', 'domain'], state),
    domainProps,
    id,
    // Disabled if the profile is restricted and doesn't have add_domains grant
    disabled: isRestrictedUser(state) && !hasGrant(state, 'add_domains'),
    origin: state.domainDrawer.origin,
  };
};

const connected = connect(mapStateToProps, mapDispatchToProps);

export default compose<CombinedProps, {}>(
  withDomainActions,
  connected,
  withRouter,
  withSnackbar
)(DomainDrawer);
