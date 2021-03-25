import { Linode } from '@linode/api-v4/lib/linodes';
import { shareAddresses } from '@linode/api-v4/lib/networking';
import { APIError } from '@linode/api-v4/lib/types';
import { flatten, remove, uniq, update } from 'ramda';
import * as React from 'react';
import { compose as recompose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import Divider from 'src/components/core/Divider';
import { Theme, makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Dialog from 'src/components/Dialog';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import TextField from 'src/components/TextField';
import { useReduxLoad } from 'src/hooks/useReduxLoad';
import withLinodes, {
  DispatchProps,
} from 'src/containers/withLinodes.container';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';

const useStyles = makeStyles((theme: Theme) => ({
  addNewButton: {
    marginTop: theme.spacing(3),
    marginBottom: -theme.spacing(2),
  },
  containerDivider: {
    marginTop: theme.spacing(1),
  },
  ipField: {
    width: '100%',
    marginTop: 0,
  },
  ipFieldLabel: {
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: `calc(175px + ${theme.spacing(2)}px)`,
    },
  },
  noIPsMessage: {
    marginTop: theme.spacing(2),
    color: theme.color.grey1,
  },
  networkActionText: {
    marginBottom: theme.spacing(2),
  },
  removeCont: {
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  remove: {
    [theme.breakpoints.down('xs')]: {
      margin: '-16px 0 0 -26px',
    },
  },
}));

interface Props {
  linodeID: number;
  linodeRegion: string;
  linodeIPs: string[];
  linodeSharedIPs: string[];
  readOnly?: boolean;
  refreshIPs: () => Promise<void>;
  open: boolean;
  onClose: () => void;
}

type CombinedProps = Props & WithLinodesProps & DispatchProps;

const selectIPText = 'Select an IP';

const IPSharingPanel: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  // We should fix this, but for now we're relying on having all Linodes in a given region
  const { _loading } = useReduxLoad(['linodes']);
  const {
    linodeIPs,
    readOnly,
    ipChoices,
    open,
    onClose,
    ipChoiceLabels,
    linodeSharedIPs,
  } = props;
  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);
  const [successMessage, setSuccessMessage] = React.useState<
    string | undefined
  >(undefined);
  const [ipsToShare, setIpsToShare] = React.useState<string[]>(linodeSharedIPs);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setIpsToShare(linodeSharedIPs);
      setErrors(undefined);
    }
  }, [open, linodeSharedIPs]);

  const onIPSelect = (ipIdx: number, e: Item<string>) => {
    if (ipIdx === undefined) {
      return;
    }

    setIpsToShare((currentIps) => update(ipIdx, e.value, currentIps));
  };

  const onIPDelete = (ipIdx: number) => {
    if (ipIdx === undefined) {
      return;
    }
    setIpsToShare((currentIps) => {
      return remove(ipIdx, 1, currentIps);
    });
  };

  const handleClose = () => {
    onClose();
    window.setTimeout(() => setSuccessMessage(undefined), 500);
  };

  const addIPToShare = () => {
    setIpsToShare((currentIPs) => [...currentIPs, selectIPText]);
  };

  const remainingChoices = (selectedIP: string) => {
    return props.ipChoices.filter((ip: string) => {
      const hasBeenSelected = ipsToShare.includes(ip);
      return ip === selectedIP || !hasBeenSelected;
    });
  };

  const onSubmit = () => {
    const finalIPs = uniq(
      ipsToShare.filter((ip: string) => ip !== selectIPText)
    );

    setErrors(undefined);
    setSubmitting(true);
    setSuccessMessage(undefined);

    shareAddresses({ linode_id: props.linodeID, ips: finalIPs })
      .then((_) => {
        props.refreshIPs();
        setErrors(undefined);
        setSubmitting(false);
        setSuccessMessage('IP Sharing updated successfully');
      })
      .catch((errorResponse) => {
        const errors = getAPIErrorOrDefault(
          errorResponse,
          'Unable to complete request at this time.'
        );

        setErrors(errors);
        setSubmitting(false);
        setSuccessMessage(undefined);
      });
  };

  const onReset = () => {
    setErrors(undefined);
    setSuccessMessage(undefined);
    setIpsToShare(linodeSharedIPs);
  };

  const noChoices = props.ipChoices.length <= 1;

  const errorMap = getErrorMap([], errors);
  const generalError = errorMap.none;

  return (
    <Dialog title="IP Sharing" open={open} onClose={handleClose}>
      <DialogContent loading={_loading}>
        <>
          {generalError && (
            <Grid item xs={12}>
              <Notice error text={generalError} />
            </Grid>
          )}
          {successMessage && (
            <Grid item xs={12}>
              <Notice success text={successMessage} />
            </Grid>
          )}
          <Grid container>
            <Grid item sm={12} lg={8} xl={6}>
              <Typography className={classes.networkActionText}>
                IP Sharing allows a Linode to share an IP address assignment
                (one or more additional IPv4 addresses). This can be used to
                allow one Linode to begin serving requests should another become
                unresponsive. Only IPs in the same datacenter are offered for
                sharing.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Grid container>
                <Grid item className={classes.ipFieldLabel}>
                  <Typography>IP Addresses</Typography>
                </Grid>
              </Grid>
              {ipChoices.length <= 1 ? (
                <Typography className={classes.noIPsMessage}>
                  You have no other Linodes in this Linode&apos;s datacenter
                  with which to share IPs.
                </Typography>
              ) : (
                <React.Fragment>
                  {linodeIPs.map((ip: string) => (
                    <IPRow key={ip} ip={ip} />
                  ))}
                  {ipsToShare.map((ip: string, idx: number) => (
                    <IPSharingRow
                      key={`${ip}-sharing-row-${idx}`}
                      ip={ip}
                      idx={idx}
                      readOnly={Boolean(readOnly)}
                      handleDelete={onIPDelete}
                      handleSelect={onIPSelect}
                      labels={ipChoiceLabels}
                      getRemainingChoices={remainingChoices}
                    />
                  ))}
                  {/* the "1" that will always be there is the selectionText */}
                  {remainingChoices('').length > 1 && (
                    <div className={classes.addNewButton}>
                      <Button
                        superCompact
                        disabled={readOnly}
                        onClick={addIPToShare}
                      >
                        Add IP Address
                      </Button>
                    </div>
                  )}
                </React.Fragment>
              )}
            </Grid>
            <Grid item>
              <ActionsPanel>
                <Button
                  loading={submitting}
                  disabled={readOnly || noChoices}
                  onClick={onSubmit}
                  buttonType="primary"
                  data-qa-submit
                >
                  Save
                </Button>
                <Button
                  disabled={submitting || noChoices}
                  onClick={onReset}
                  buttonType="secondary"
                  data-qa-reset
                >
                  Reset Form
                </Button>
              </ActionsPanel>
            </Grid>
          </Grid>
        </>
      </DialogContent>
    </Dialog>
  );
};

interface WrapperProps {
  loading: boolean;
  children: JSX.Element;
}

// Content Wrapper
const DialogContent: React.FC<WrapperProps> = (props) => {
  if (props.loading) {
    return <CircleProgress />;
  }
  return props.children;
};

// IP Row
interface RowProps {
  ip: string;
}

export const IPRow: React.FC<RowProps> = React.memo((props) => {
  const { ip } = props;
  const classes = useStyles();
  return (
    <Grid container key={ip}>
      <Grid item xs={12}>
        <Divider className={classes.containerDivider} />
      </Grid>
      <Grid item xs={12}>
        <TextField
          disabled
          value={ip}
          className={classes.ipField}
          label="IP Address"
          hideLabel
        />
      </Grid>
    </Grid>
  );
});

// IP Sharing Row
interface SharingRowProps extends RowProps {
  idx: number;
  readOnly: boolean;
  labels: Record<string, string>;
  getRemainingChoices: (ip: string) => string[];
  handleSelect: (idx: number, selected: Item<string>) => void;
  handleDelete: (idx: number) => void;
}

export const IPSharingRow: React.FC<SharingRowProps> = React.memo((props) => {
  const {
    ip,
    idx,
    getRemainingChoices,
    handleDelete,
    handleSelect,
    labels,
    readOnly,
  } = props;
  const classes = useStyles();

  const ipList = getRemainingChoices(ip).map((ipChoice: string) => {
    const label = `${ipChoice} ${
      labels[ipChoice] !== undefined ? labels[ipChoice] : ''
    }`;
    return { label, value: ipChoice };
  });

  const selectedIP = ipList.find((eachIP) => {
    return eachIP.value === ip;
  });

  return (
    <Grid container key={idx}>
      <Grid item xs={12}>
        <Divider className={classes.containerDivider} />
      </Grid>
      <Grid item xs={12} sm={10}>
        <Select
          value={selectedIP}
          options={ipList}
          onChange={(selected: Item<string>) => handleSelect(idx, selected)}
          className={classes.ipField}
          textFieldProps={{
            dataAttrs: {
              'data-qa-share-ip': true,
            },
          }}
          disabled={readOnly}
          isClearable={false}
          placeholder="Select an IP"
          label="Select an IP"
          inputId={`ip-select-${idx}`}
          hideLabel
          overflowPortal
        />
      </Grid>
      <Grid item className={classes.removeCont}>
        <Button
          buttonType="remove"
          onClick={() => handleDelete(idx)}
          className={classes.remove}
          data-qa-remove-shared-ip
          disabled={readOnly}
        />
      </Grid>
    </Grid>
  );
});

interface WithLinodesProps {
  ipChoices: string[];
  ipChoiceLabels: {
    [key: string]: string;
  };
}

const enhanced = recompose<CombinedProps, Props & RenderGuardProps>(
  RenderGuard,
  withLinodes<WithLinodesProps, Props>((ownProps, linodesData) => {
    const { linodeRegion, linodeID } = ownProps;
    const choiceLabels = {};
    const ipChoices = flatten<string>(
      linodesData
        .filter((linode: Linode) => {
          // Filter out:
          // 1. The current Linode
          // 2. Linodes outside of the current Linode's region
          return linode.id !== linodeID && linode.region === linodeRegion;
        })
        .map((linode: Linode) => {
          // side-effect of this mapping is saving the labels
          linode.ipv4.forEach((ip: string) => {
            choiceLabels[ip] = linode.label;
          });
          return linode.ipv4;
        })
    );
    /**
     * NB: We were previously filtering private IP addresses out at this point,
     * but it seems that the API (or our infra) doesn't care about this.
     */
    ipChoices.unshift(selectIPText);
    return {
      ipChoices,
      ipChoiceLabels: choiceLabels,
    };
  })
);

export default enhanced(IPSharingPanel);
