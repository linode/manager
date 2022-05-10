import { Linode } from '@linode/api-v4/lib/linodes';
import {
  shareAddresses,
  shareAddressesv4,
  IPRangeInformation,
} from '@linode/api-v4/lib/networking';
import { APIError } from '@linode/api-v4/lib/types';
import { remove, uniq, update } from 'ramda';
import * as React from 'react';
import { compose as recompose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Link from 'src/components/Link';
import CircleProgress from 'src/components/CircleProgress';
import Divider from 'src/components/core/Divider';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Dialog from 'src/components/Dialog';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import TextField from 'src/components/TextField';
import useFlags from 'src/hooks/useFlags';
import { API_MAX_PAGE_SIZE } from 'src/constants';
import { useAllLinodesQuery } from 'src/queries/linodes';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';

const useStyles = makeStyles((theme: Theme) => ({
  addNewButton: {
    marginTop: theme.spacing(3),
    marginBottom: -theme.spacing(2),
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
  availableRanges: IPRangeInformation[];
  readOnly?: boolean;
  refreshIPs: () => Promise<void>[];
  open: boolean;
  onClose: () => void;
}

type CombinedProps = Props;

type AvailableRangesMap = { [linode_id: number]: string[] };

const IPSharingPanel: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const flags = useFlags();
  const {
    linodeID,
    linodeIPs,
    linodeRegion,
    readOnly,
    open,
    onClose,
    linodeSharedIPs,
    availableRanges,
  } = props;

  const availableRangesMap: AvailableRangesMap = formatAvailableRanges(
    availableRanges
  );

  const { data: linodes, isLoading } = useAllLinodesQuery(
    { page_size: API_MAX_PAGE_SIZE },
    {
      region: linodeRegion,
    },
    open // Only run the query if the modal is open
  );

  const getIPChoicesAndLabels = (
    linodeID: number,
    linodes: Linode[]
  ): Record<number, string> => {
    const choiceLabels = linodes.reduce((previousValue, currentValue) => {
      // Filter out the current Linode
      if (currentValue.id === linodeID) {
        return previousValue;
      }

      currentValue.ipv4.forEach((ip) => {
        previousValue[ip] = currentValue.label;
      });

      if (flags.ipv6Sharing) {
        availableRangesMap?.[currentValue.id]?.forEach((range: string) => {
          previousValue[range] = currentValue.label;
          updateIPToLinodeID({
            [range]: [...(ipToLinodeID?.[range] ?? []), currentValue.id],
          });
        });
      }

      return previousValue;
    }, {});

    linodeSharedIPs.forEach((range) => {
      if (!choiceLabels.hasOwnProperty(range)) {
        choiceLabels[range] = '';
      }
    });

    return choiceLabels;
  };

  const [ipChoices, setIPChoices] = React.useState({});
  const [ipToLinodeID, setIPToLinodeID] = React.useState({});

  const updateIPToLinodeID = (newData: Record<string, number[]>) => {
    setIPToLinodeID((previousState) => {
      return { ...previousState, ...newData };
    });
  };

  React.useEffect(() => {
    // don't try anything until we've finished the request for the Linodes data
    if (isLoading) {
      return;
    }
    const ipChoices = getIPChoicesAndLabels(linodeID, linodes ?? []);
    setIPChoices(ipChoices);
  }, [linodeID, linodes, availableRanges]);

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
    setIpsToShare((currentIps) => {
      return ipIdx >= currentIps.length
        ? [...currentIps, e.value]
        : update(ipIdx, e.value, currentIps);
    });
  };

  const onIPDelete = (ipIdx: number) => {
    setIpsToShare((currentIps) => {
      return remove(ipIdx, 1, currentIps);
    });
  };

  const handleClose = () => {
    onClose();
    window.setTimeout(() => setSuccessMessage(undefined), 500);
  };

  const remainingChoices = (selectedIP: string): string[] => {
    return Object.keys(ipChoices).filter((ip: string) => {
      const hasBeenSelected = ipsToShare.includes(ip);
      return ip === selectedIP || !hasBeenSelected;
    });
  };

  const onSubmit = () => {
    const groupedUnsharedRanges = {};
    const finalIPs: string[] = uniq(
      ipsToShare.reduce((previousValue, currentValue) => {
        if (currentValue === undefined || currentValue === null) {
          return previousValue;
        }
        const strippedIP: string = currentValue.split('/')[0];

        // Filter out v4s and shared v6 ranges as only v6s and unshared ips will be added
        const isStaticv6 = ipToLinodeID?.[currentValue]?.length === 1;
        // For any IP in finalIPs that isn't shared (length of linode_ids === 1)
        // make note in groupedUnsharedRanges so that we can first share that IP to
        // the Linode it is statically routed to, then to the current Linode
        if (isStaticv6) {
          const linode_id = ipToLinodeID[currentValue][0];
          if (groupedUnsharedRanges.hasOwnProperty(linode_id)) {
            groupedUnsharedRanges[linode_id] = [
              ...groupedUnsharedRanges[linode_id],
              [strippedIP],
            ];
          } else {
            groupedUnsharedRanges[linode_id] = [strippedIP];
          }
        }

        return [...previousValue, strippedIP];
      }, [])
    );

    // use local variable and state because useState won't update state right away
    // and useEffect won't play nicely here
    let localErrors: APIError[] | undefined = undefined;
    setErrors(undefined);
    let localSubmitting = true;
    setSubmitting(localSubmitting);
    setSuccessMessage(undefined);

    const share = flags.ipv6Sharing ? shareAddresses : shareAddressesv4;
    const promises: Promise<void | {}>[] = [];

    if (flags.ipv6Sharing) {
      // share unshared ranges first to their staticly routed Linode, then later we can share to the current Linode
      Object.keys(groupedUnsharedRanges).forEach((linode_id) => {
        promises.push(
          shareAddresses({
            linode_id: parseInt(linode_id, 10),
            ips: groupedUnsharedRanges[linode_id],
          }).catch((errorResponse) => {
            const errors = getAPIErrorOrDefault(
              errorResponse,
              'Unable to complete request at this time.'
            );
            localErrors = errors;
            setErrors(errors);
            localSubmitting = false;
            setSubmitting(false);
            setSuccessMessage(undefined);
          })
        );
      });
    }

    Promise.all(promises).then(() => {
      if (!localSubmitting || !!localErrors) {
        return;
      }

      share({ linode_id: props.linodeID, ips: finalIPs })
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
    });
  };

  const onReset = () => {
    setErrors(undefined);
    setSuccessMessage(undefined);
    setIpsToShare(linodeSharedIPs);
  };

  const noChoices = Object.keys(ipChoices).length === 0;

  const errorMap = getErrorMap([], errors);
  const generalError = errorMap.none;
  return (
    <Dialog title="IP Sharing" open={open} onClose={handleClose}>
      <DialogContent loading={isLoading}>
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
              {flags.ipv6Sharing ? (
                <Notice warning>
                  <Typography style={{ fontSize: '0.875rem' }}>
                    <strong>Warning:</strong> Converting a statically routed
                    IPv6 range to a shared range will break existing IPv6
                    connectivity unless each Linode that shares the range has
                    BGP set up to advertise that range. Follow{' '}
                    <Link to="https://www.linode.com/docs/guides/ip-failover/">
                      this guide
                    </Link>{' '}
                    to set up BGP on a Linode.
                  </Typography>
                </Notice>
              ) : null}
              <Typography className={classes.networkActionText}>
                IP Sharing allows a Linode to share an IP address assignment
                (one or more additional IP addresses). This can be used to allow
                one Linode to begin serving requests should another become
                unresponsive. Only IPs in the same datacenter are offered for
                sharing.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Grid container>
                <Grid item className={classes.ipFieldLabel}>
                  <Typography style={{ fontWeight: 'bold' }}>
                    IP Addresses
                  </Typography>
                </Grid>
              </Grid>
              {noChoices ? (
                <Typography className={classes.noIPsMessage}>
                  You have no other Linodes in this Linode&rsquo;s datacenter
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
                      labels={ipChoices}
                      getRemainingChoices={remainingChoices}
                    />
                  ))}
                  {remainingChoices('').length > 0 && (
                    <IPSharingRow
                      key={`empty-sharing-row`}
                      ip={''}
                      idx={ipsToShare.length}
                      readOnly={Boolean(readOnly)}
                      handleSelect={onIPSelect}
                      labels={ipChoices}
                      getRemainingChoices={remainingChoices}
                    />
                  )}
                </React.Fragment>
              )}
            </Grid>
            <Grid container item justifyContent="flex-end" className="m0">
              <ActionsPanel>
                <Button
                  buttonType="secondary"
                  disabled={submitting || noChoices}
                  onClick={onReset}
                  data-qa-reset
                >
                  Reset Form
                </Button>
                <Button
                  buttonType="primary"
                  disabled={readOnly || noChoices}
                  loading={submitting}
                  onClick={onSubmit}
                  data-qa-submit
                >
                  Save
                </Button>
              </ActionsPanel>
            </Grid>
          </Grid>
        </>
      </DialogContent>
    </Dialog>
  );
};

const formatAvailableRanges = (
  availableRanges: IPRangeInformation[]
): AvailableRangesMap => {
  const availableRangesMap: {
    [linode_id: number]: string[];
  } = availableRanges.reduce((previousValue, currentValue) => {
    // use the first entry in linodes as we're only dealing with ranges unassociated with this
    // Linode, so we just use whatever the first Linode is to later get the label for this range
    previousValue[currentValue.linodes[0]] = [
      ...(previousValue?.[currentValue.linodes[0]] ?? []),
      `${currentValue.range}/${currentValue.prefix}`,
    ];
    return previousValue;
  }, {});

  return availableRangesMap;
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
        <Divider spacingBottom={0} />
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
  getRemainingChoices: (ip: string | undefined) => string[];
  handleSelect: (idx: number, selected: Item<string>) => void;
  handleDelete?: (idx: number) => void;
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
        <Divider spacingBottom={0} />
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
      {handleDelete ? (
        <Grid item sm={2} className={classes.removeCont}>
          <Button
            buttonType="outlined"
            className={classes.remove}
            disabled={readOnly}
            onClick={() => handleDelete(idx)}
            data-qa-remove-shared-ip
          >
            Remove
          </Button>
        </Grid>
      ) : null}
    </Grid>
  );
});

const enhanced = recompose<CombinedProps, Props & RenderGuardProps>(
  RenderGuard
);

export default enhanced(IPSharingPanel);
