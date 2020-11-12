import {
  createDomainRecord,
  Domain,
  DomainType
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
import Breadcrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import DocumentationButton from 'src/components/DocumentationButton';
import FormControlLabel from 'src/components/core/FormControlLabel';
import FormHelperText from 'src/components/core/FormHelperText';
import Grid from 'src/components/core/Grid';
import Paper from 'src/components/core/Paper';
import RadioGroup from 'src/components/core/RadioGroup';
import { makeStyles, Theme } from 'src/components/core/styles';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import MultipleIPInput from 'src/components/MultipleIPInput';
import Notice from 'src/components/Notice';
import Radio from 'src/components/Radio';
import TagsInput, { Tag } from 'src/components/TagsInput';
import TextField from 'src/components/TextField';
import { reportException } from 'src/exceptionReporting';
import LinodeSelect from 'src/features/linodes/LinodeSelect';
import NodeBalancerSelect from 'src/features/NodeBalancers/NodeBalancerSelect';
import {
  hasGrant,
  isRestrictedUser
} from 'src/features/Profile/permissionsHelpers';
import { ApplicationState } from 'src/store';
import {
  Origin as DomainDrawerOrigin,
  resetDrawer
} from 'src/store/domainDrawer';
import { upsertDomain } from 'src/store/domains/domains.actions';
import {
  DomainActionsProps,
  withDomainActions
} from 'src/store/domains/domains.container';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';
import { sendCreateDomainEvent } from 'src/utilities/ga';
import {
  ExtendedIP,
  extendedIPToString,
  stringToExtendedIP
} from 'src/utilities/ipUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(3)
  },
  main: {
    width: '100%'
  },
  inner: {
    padding: theme.spacing(3),
    paddingTop: theme.spacing(2),
    '& > div': {
      marginBottom: theme.spacing(2)
    },
    '& label': {
      color: theme.color.headline,
      fontWeight: 600,
      lineHeight: '1.33rem',
      letterSpacing: '0.25px',
      margin: 0
    }
  },
  radio: {
    '& label:first-child .MuiButtonBase-root': {
      marginLeft: -10
    }
  },
  ip: {
    maxWidth: 468
  },
  helperText: {
    maxWidth: 'none'
  }
}));

type DefaultRecordsType = 'none' | 'linode' | 'nodebalancer';

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
      target: ipv4
    }),
    createDomainRecord(domainID, {
      type: 'A',
      target: ipv4,
      name: 'www'
    }),
    createDomainRecord(domainID, {
      type: 'A',
      target: ipv4,
      name: 'mail'
    })
  ];

  return Promise.all(
    /** ipv6 can be null so don't try to create domain records in that case */
    !!cleanedIPv6
      ? [
          ...baseIPv4Requests,
          createDomainRecord(domainID, {
            type: 'AAAA',
            target: cleanedIPv6
          }),
          createDomainRecord(domainID, {
            type: 'AAAA',
            target: cleanedIPv6,
            name: 'www'
          }),
          createDomainRecord(domainID, {
            type: 'AAAA',
            target: cleanedIPv6,
            name: 'mail'
          }),
          createDomainRecord(domainID, {
            type: 'MX',
            priority: 10,
            target: `mail.${domain}`
          })
        ]
      : baseIPv4Requests
  );
};

export const CreateDomain: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { disabled, domainActions, origin } = props;

  const [mounted, setMounted] = React.useState<boolean>(false);

  const [domain, setDomain] = React.useState<string>('');
  const [type, setType] = React.useState<DomainType>('master');
  const [soaEmail, setSOAEmail] = React.useState<string>('');
  const [tags, setTags] = React.useState<Tag[]>([]);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<APIError[]>([]);
  const [master_ips, setMaster_IPS] = React.useState<string[]>([]);
  const [defaultRecordsSetting, setDefaultRecordsSetting] = React.useState<
    DefaultRecordsType
  >('none');
  const [selectedDefaultLinode, setSelectedDefaultLinode] = React.useState<
    Linode | undefined
  >(undefined);
  const [
    selectedDefaultNodeBalancer,
    setSelectedDefaultNodeBalancer
  ] = React.useState<NodeBalancer | undefined>(undefined);

  React.useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  const errorMap = getErrorMap(
    [
      'master_ips',
      'domain',
      'type',
      'soa_email',
      'tags',
      'defaultNodeBalancer',
      'defaultLinode'
    ],
    errors
  );

  const generalError = errorMap.none;
  const masterIPsError = errorMap.master_ips;

  const isCreatingMasterDomain = type === 'master';
  const isCreatingSlaveDomain = type === 'slave';

  const redirect = (id: number | '', state?: Record<string, string>) => {
    const returnPath = !!id ? `/domains/${id}` : '/domains';
    props.history.push(returnPath, state);
  };

  const redirectToLandingOrDetail = (
    type: 'master' | 'slave',
    domainID: number,
    state: Record<string, string> = {}
  ) => {
    if (type === 'master' && domainID) {
      redirect(domainID, state);
    } else {
      redirect('', state);
    }
  };

  const create = () => {
    const _tags = tags.map(tag => tag.value);

    const finalMasterIPs = master_ips.filter(v => v !== '');

    if (type === 'slave' && finalMasterIPs.length === 0) {
      setSubmitting(false);
      setErrors([
        {
          field: 'master_ips',
          reason: 'You must provide at least one Master Nameserver IP Address'
        }
      ]);
      return;
    }

    /**
     * In this case, the user wants default domain records created, but
     * they haven't supplied a Linode or NodeBalancer
     */
    if (defaultRecordsSetting === 'linode' && !selectedDefaultLinode) {
      return setErrors([
        {
          reason: 'Please select a Linode.',
          field: 'defaultLinode'
        }
      ]);
    }

    if (
      defaultRecordsSetting === 'nodebalancer' &&
      !selectedDefaultNodeBalancer
    ) {
      return setErrors([
        {
          reason: 'Please select a NodeBalancer.',
          field: 'defaultNodeBalancer'
        }
      ]);
    }

    const data =
      type === 'master'
        ? { domain, type, _tags, soa_email: soaEmail }
        : { domain, type, _tags, master_ips: finalMasterIPs };

    setSubmitting(true);
    domainActions
      .createDomain(data)
      .then((domainData: Domain) => {
        if (!mounted) {
          return;
        }
        sendCreateDomainEvent(origin);
        /**
         * Now we check to see if the user wanted us to automatically create
         * domain records for them. If so, create some A/AAAA and MX records
         * with the first IPv4 and IPv6 from the Linode or NodeBalancer they
         * selected.
         *
         * This only applies to master domains.
         */
        if (type === 'master') {
          if (defaultRecordsSetting === 'linode') {
            return generateDefaultDomainRecords(
              domainData.domain,
              domainData.id,
              path(['ipv4', 0], selectedDefaultLinode),
              path(['ipv6'], selectedDefaultLinode)
            )
              .then(() => {
                return redirectToLandingOrDetail(type, domainData.id);
              })
              .catch((e: APIError[]) => {
                reportException(
                  `Default DNS Records couldn't be created from Linode: ${e[0].reason}`,
                  {
                    selectedLinode: selectedDefaultLinode!.id,
                    domainID: domainData.id,
                    ipv4: path(['ipv4', 0], selectedDefaultLinode),
                    ipv6: path(['ipv6'], selectedDefaultLinode)
                  }
                );
                return redirectToLandingOrDetail(type, domainData.id, {
                  recordError:
                    'There was an issue creating default domain records.'
                });
              });
          }

          if (defaultRecordsSetting === 'nodebalancer') {
            return generateDefaultDomainRecords(
              domainData.domain,
              domainData.id,
              path(['ipv4'], selectedDefaultNodeBalancer),
              path(['ipv6'], selectedDefaultNodeBalancer)
            )
              .then(() => {
                return redirectToLandingOrDetail(type, domainData.id);
              })
              .catch((e: APIError[]) => {
                reportException(
                  `Default DNS Records couldn't be created from NodeBalancer: ${e[0].reason}`,
                  {
                    selectedNodeBalancer: selectedDefaultNodeBalancer!.id,
                    domainID: domainData.id,
                    ipv4: path(['ipv4'], selectedDefaultNodeBalancer),
                    ipv6: path(['ipv6'], selectedDefaultNodeBalancer)
                  }
                );
                return redirectToLandingOrDetail(type, domainData.id, {
                  recordError:
                    'There was an issue creating default domain records.'
                });
              });
          }
        }
        return redirectToLandingOrDetail(type, domainData.id);
      })
      .catch(err => {
        if (!mounted) {
          return;
        }
        setSubmitting(false);
        setErrors(getAPIErrorOrDefault(err));
        scrollErrorIntoView();
      });
  };

  const updateLabel = (e: React.ChangeEvent<HTMLInputElement>) =>
    setDomain(e.target.value);

  const updateEmailAddress = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSOAEmail(e.target.value);

  const updateSelectedLinode = (linode: Linode) =>
    setSelectedDefaultLinode(linode);

  const updateSelectedNodeBalancer = (nodebalancer: NodeBalancer) =>
    setSelectedDefaultNodeBalancer(nodebalancer);

  const updateTags = (selected: Tag[]) => setTags(selected);

  const updateInsertDefaultRecords = (value: DefaultRecordsType) =>
    setDefaultRecordsSetting(value);

  const updateType = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: 'master' | 'slave'
  ) => {
    setType(value);
    setErrors([]);
  };

  const updateMasterIPAddress = (newIPs: ExtendedIP[]) => {
    const master_ips =
      newIPs.length > 0 ? newIPs.map(extendedIPToString) : [''];
    if (mounted) {
      setMaster_IPS(master_ips);
    }
  };

  return (
    <Grid container>
      <DocumentTitleSegment segment="Create a Domain" />
      <Grid
        container
        justify="space-between"
        alignItems="flex-end"
        className={classes.title}
      >
        <Grid item>
          <Breadcrumb
            pathname={location.pathname}
            labelTitle="Create a Domain"
            labelOptions={{ noCap: true }}
          />
        </Grid>
        <Grid item>
          <Grid container alignItems="flex-end">
            <Grid item className="pt0">
              <DocumentationButton href="https://www.linode.com/docs/guides/dns-manager/" />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Grid item className={classes.main}>
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

        <Paper data-qa-label-header>
          <div className={classes.inner}>
            <RadioGroup
              aria-label="type"
              className={classes.radio}
              name="type"
              onChange={updateType}
              row
              value={type}
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
              errorText={errorMap.domain}
              value={domain}
              disabled={disabled}
              label="Domain"
              onChange={updateLabel}
              data-qa-domain-name
              data-testid="domain-name-input"
            />
            {isCreatingMasterDomain && (
              <TextField
                errorText={errorMap.soa_email}
                value={soaEmail}
                label="SOA Email Address"
                onChange={updateEmailAddress}
                data-qa-soa-email
                data-testid="soa-email-input"
                disabled={disabled}
              />
            )}
            {isCreatingSlaveDomain && (
              <MultipleIPInput
                title="Master Nameserver IP Address"
                className={classes.ip}
                ips={master_ips.map(stringToExtendedIP)}
                onChange={updateMasterIPAddress}
                error={masterIPsError}
              />
            )}
            <TagsInput
              value={tags}
              onChange={updateTags}
              tagError={errorMap.tags}
              disabled={disabled}
            />
            {isCreatingMasterDomain && (
              <React.Fragment>
                <Select
                  isClearable={false}
                  onChange={(value: Item<DefaultRecordsType>) =>
                    updateInsertDefaultRecords(value.value)
                  }
                  defaultValue={{
                    value: 'none',
                    label: 'Do not insert default records for me.'
                  }}
                  label="Insert Default Records"
                  options={[
                    {
                      value: 'none',
                      label: 'Do not insert default records for me.'
                    },
                    {
                      value: 'linode',
                      label: 'Insert default records from one of my Linodes.'
                    },
                    {
                      value: 'nodebalancer',
                      label:
                        'Insert default records from one of my NodeBalancers.'
                    }
                  ]}
                  disabled={disabled}
                />
                <FormHelperText className={classes.helperText}>
                  If specified, we can automatically create some domain records
                  (A/AAAA and MX) to get you started, based on one of your
                  Linodes or NodeBalancers.
                </FormHelperText>
              </React.Fragment>
            )}
            {isCreatingMasterDomain && defaultRecordsSetting === 'linode' && (
              <React.Fragment>
                <LinodeSelect
                  linodeError={errorMap.defaultLinode}
                  handleChange={updateSelectedLinode}
                  selectedLinode={
                    selectedDefaultLinode ? selectedDefaultLinode.id : null
                  }
                  disabled={disabled}
                />
                {!errorMap.defaultLinode && (
                  <FormHelperText>
                    {selectedDefaultLinode && !selectedDefaultLinode.ipv6
                      ? `We'll automatically create domains for the first IPv4 address on this
                  Linode.`
                      : `We'll automatically create domain records for both the first
                  IPv4 and IPv6 addresses on this Linode.`}
                  </FormHelperText>
                )}
              </React.Fragment>
            )}
            {isCreatingMasterDomain &&
              defaultRecordsSetting === 'nodebalancer' && (
                <React.Fragment>
                  <NodeBalancerSelect
                    nodeBalancerError={errorMap.defaultNodeBalancer}
                    handleChange={updateSelectedNodeBalancer}
                    selectedNodeBalancer={
                      selectedDefaultNodeBalancer
                        ? selectedDefaultNodeBalancer.id
                        : null
                    }
                    disabled={disabled}
                  />
                  {!errorMap.defaultNodeBalancer && (
                    <FormHelperText>
                      {selectedDefaultNodeBalancer &&
                      !selectedDefaultNodeBalancer.ipv6
                        ? `We'll automatically create domains for the first IPv4 address on this
                NodeBalancer.`
                        : `We'll automatically create domain records for both the first
                IPv4 and IPv6 addresses on this NodeBalancer.`}
                    </FormHelperText>
                  )}
                </React.Fragment>
              )}
            <ActionsPanel>
              <Button
                buttonType="primary"
                onClick={create}
                data-qa-submit
                data-testid="create-domain-submit"
                loading={submitting}
                disabled={disabled}
              >
                Create
              </Button>
            </ActionsPanel>
          </div>
        </Paper>
      </Grid>
    </Grid>
  );
};

interface DispatchProps {
  resetDrawer: () => void;
  upsertDomain: (domain: Domain) => void;
}

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators({ resetDrawer, upsertDomain }, dispatch);

interface StateProps {
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
    domain: path(['domainDrawer', 'domain'], state),
    domainProps,
    id,
    // Disabled if the profile is restricted and doesn't have add_domains grant
    disabled: isRestrictedUser(state) && !hasGrant(state, 'add_domains'),
    origin: state.domainDrawer.origin
  };
};

const connected = connect(mapStateToProps, mapDispatchToProps);

export default compose<CombinedProps, {}>(
  withDomainActions,
  connected,
  withRouter,
  withSnackbar
)(CreateDomain);
