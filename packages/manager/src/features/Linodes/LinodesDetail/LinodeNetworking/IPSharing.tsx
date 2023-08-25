import { Linode } from '@linode/api-v4/lib/linodes';
import { IPRangeInformation } from '@linode/api-v4/lib/networking';
import { APIError } from '@linode/api-v4/lib/types';
import Grid from '@mui/material/Unstable_Grid2';
import { styled, useTheme } from '@mui/material/styles';
import { remove, uniq, update } from 'ramda';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { CircleProgress } from 'src/components/CircleProgress';
import { Dialog } from 'src/components/Dialog/Dialog';
import { Divider } from 'src/components/Divider';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { API_MAX_PAGE_SIZE } from 'src/constants';
import { useFlags } from 'src/hooks/useFlags';
import {
  useAllLinodesQuery,
  useLinodeQuery,
} from 'src/queries/linodes/linodes';
import {
  useAllDetailedIPv6RangesQuery,
  useLinodeIPsQuery,
  useLinodeShareIPMutation,
} from 'src/queries/linodes/networking';
import { areArraysEqual } from 'src/utilities/areArraysEqual';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';

interface Props {
  linodeId: number;
  onClose: () => void;
  open: boolean;
  readOnly?: boolean;
}

type AvailableRangesMap = { [linode_id: number]: string[] };

const IPSharingPanel = (props: Props) => {
  const theme = useTheme();
  const flags = useFlags();
  const { linodeId, onClose, open, readOnly } = props;
  const { data: linode } = useLinodeQuery(linodeId);

  const { data: ips } = useLinodeIPsQuery(linodeId, open);

  const { data: ranges } = useAllDetailedIPv6RangesQuery(
    {},
    { region: linode?.region },
    open
  );

  const { mutateAsync: shareAddresses } = useLinodeShareIPMutation();

  const rangeData = ranges?.reduce(
    (
      acc: {
        availableRanges: IPRangeInformation[];
        sharedRanges: IPRangeInformation[];
      },
      range
    ) => {
      if (
        flags.ipv6Sharing &&
        range.is_bgp &&
        range.linodes.includes(linodeId)
      ) {
        // any range that is shared to this linode
        acc.sharedRanges.push(range);
      } else if (flags.ipv6Sharing) {
        // any range that is not shared to this linode or static on this linode
        acc.availableRanges.push(range);
      }
      return acc;
    },
    { availableRanges: [], sharedRanges: [] }
  );

  const sharedRanges = rangeData?.sharedRanges ?? [];
  const availableRanges = rangeData?.availableRanges ?? [];

  const linodeSharedIPs = [
    ...(ips?.ipv4.shared.map((ip) => ip.address) ?? []),
    ...sharedRanges?.map((range) => `${range.range}/${range.prefix}`),
  ];

  const linodeIPs = ips?.ipv4.public.map((i) => i.address) ?? [];

  const availableRangesMap: AvailableRangesMap = formatAvailableRanges(
    availableRanges
  );

  const { data: linodes, isLoading } = useAllLinodesQuery(
    { page_size: API_MAX_PAGE_SIZE },
    {
      region: linode?.region,
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

  let ipToLinodeID = {};

  const updateIPToLinodeID = (newData: Record<string, number[]>) => {
    ipToLinodeID = { ...ipToLinodeID, ...newData };
  };

  const ipChoices = getIPChoicesAndLabels(linodeId, linodes ?? []);

  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);
  const [successMessage, setSuccessMessage] = React.useState<
    string | undefined
  >(undefined);
  const [ipsToShare, setIpsToShare] = React.useState<string[]>(linodeSharedIPs);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (ips && ranges && !areArraysEqual(linodeSharedIPs, ipsToShare)) {
      setIpsToShare(linodeSharedIPs);
      setErrors(undefined);
    }
  }, [ips, ranges]);

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
              strippedIP,
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

    // if the user hasn't selected any IP to share or hasn't removed any, don't do anything
    if (areArraysEqual(linodeSharedIPs, ipsToShare)) {
      setErrors([{ reason: 'Please select an action.' }]);
      setSubmitting(false);

      return;
    }

    const promises: Promise<{} | void>[] = [];

    if (flags.ipv6Sharing) {
      // share unshared ranges first to their staticly routed Linode, then later we can share to the current Linode
      Object.keys(groupedUnsharedRanges).forEach((linode_id) => {
        promises.push(
          shareAddresses({
            ips: groupedUnsharedRanges[linode_id],
            linode_id: parseInt(linode_id, 10),
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

      shareAddresses({ ips: finalIPs, linode_id: linodeId })
        .then((_) => {
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
    <Dialog fullWidth onClose={handleClose} open={open} title="IP Sharing">
      <DialogContent loading={isLoading}>
        <>
          {generalError && (
            <Grid xs={12}>
              <Notice text={generalError} variant="error" />
            </Grid>
          )}
          {successMessage && (
            <Grid xs={12}>
              <Notice text={successMessage} variant="success" />
            </Grid>
          )}
          <Grid container>
            <Grid lg={8} sm={12} xl={6}>
              {flags.ipv6Sharing ? (
                <Notice variant="warning">
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
              <Typography sx={{ marginBottom: theme.spacing(2) }}>
                IP Sharing allows a Linode to share an IP address assignment
                (one or more additional IP addresses). This can be used to allow
                one Linode to begin serving requests should another become
                unresponsive. Only IPs in the same datacenter are offered for
                sharing.
              </Typography>
            </Grid>
            <Grid xs={12}>
              <Grid container>
                <Grid
                  sx={{
                    [theme.breakpoints.up('sm')]: {
                      width: `calc(175px + ${theme.spacing(2)})`,
                    },
                    width: '100%',
                  }}
                >
                  <Typography style={{ fontWeight: 'bold' }}>
                    IP Addresses
                  </Typography>
                </Grid>
              </Grid>
              {noChoices ? (
                <Typography
                  sx={{
                    color: theme.color.grey1,
                    marginTop: theme.spacing(2),
                  }}
                >
                  You have no other Linodes in this Linode&rsquo;s datacenter
                  with which to share IPs.
                </Typography>
              ) : (
                <React.Fragment>
                  {linodeIPs.map((ip: string) => (
                    <IPRow ip={ip} key={ip} />
                  ))}
                  {ipsToShare.map((ip: string, idx: number) => (
                    <IPSharingRow
                      getRemainingChoices={remainingChoices}
                      handleDelete={onIPDelete}
                      handleSelect={onIPSelect}
                      idx={idx}
                      ip={ip}
                      key={`${ip}-sharing-row-${idx}`}
                      labels={ipChoices}
                      readOnly={Boolean(readOnly)}
                    />
                  ))}
                  {remainingChoices('').length > 0 && (
                    <IPSharingRow
                      getRemainingChoices={remainingChoices}
                      handleSelect={onIPSelect}
                      idx={ipsToShare.length}
                      ip={''}
                      key={`empty-sharing-row`}
                      labels={ipChoices}
                      readOnly={Boolean(readOnly)}
                    />
                  )}
                </React.Fragment>
              )}
            </Grid>
          </Grid>
        </>
      </DialogContent>
      <ActionsPanel
        primaryButtonProps={{
          'data-testid': 'submit',
          disabled: readOnly || noChoices,
          label: 'Save',
          loading: submitting,
          onClick: onSubmit,
        }}
        secondaryButtonProps={{
          'data-testid': 'reset',
          disabled: submitting || noChoices,
          label: 'Reset Form',
          onClick: onReset,
        }}
      />
    </Dialog>
  );
};

const formatAvailableRanges = (
  availableRanges: IPRangeInformation[]
): AvailableRangesMap => {
  return availableRanges.reduce((previousValue, currentValue) => {
    // use the first entry in linodes as we're only dealing with ranges unassociated with this
    // Linode, so we just use whatever the first Linode is to later get the label for this range
    previousValue[currentValue.linodes[0]] = [
      ...(previousValue?.[currentValue.linodes[0]] ?? []),
      `${currentValue.range}/${currentValue.prefix}`,
    ];
    return previousValue;
  }, {});
};

interface WrapperProps {
  children: JSX.Element;
  loading: boolean;
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
  return (
    <Grid container key={ip} spacing={2}>
      <Grid xs={12}>
        <Divider spacingBottom={0} />
      </Grid>
      <Grid xs={12}>
        <TextField
          sx={{ marginTop: 0, width: '100%' }}
          disabled
          hideLabel
          label="IP Address"
          value={ip}
        />
      </Grid>
    </Grid>
  );
});

// IP Sharing Row
interface SharingRowProps extends RowProps {
  getRemainingChoices: (ip: string | undefined) => string[];
  handleDelete?: (idx: number) => void;
  handleSelect: (idx: number, selected: Item<string>) => void;
  idx: number;
  labels: Record<string, string>;
  readOnly: boolean;
}

export const IPSharingRow: React.FC<SharingRowProps> = React.memo((props) => {
  const {
    getRemainingChoices,
    handleDelete,
    handleSelect,
    idx,
    ip,
    labels,
    readOnly,
  } = props;
  const theme = useTheme();

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
    <Grid container key={idx} spacing={2}>
      <Grid xs={12}>
        <Divider spacingBottom={0} />
      </Grid>
      <Grid sm={10} xs={12}>
        <StyledSelect
          textFieldProps={{
            dataAttrs: {
              'data-qa-share-ip': true,
            },
          }}
          disabled={readOnly}
          hideLabel
          inputId={`ip-select-${idx}`}
          isClearable={false}
          label="Select an IP"
          onChange={(selected: Item<string>) => handleSelect(idx, selected)}
          options={ipList}
          overflowPortal
          placeholder="Select an IP"
          value={selectedIP}
        />
      </Grid>
      {handleDelete ? (
        <Grid
          sm={2}
          sx={{
            [theme.breakpoints.down('sm')]: {
              width: '100%',
            },
          }}
        >
          <Button
            buttonType="outlined"
            data-qa-remove-shared-ip
            disabled={readOnly}
            onClick={() => handleDelete(idx)}
            sx={{
              [theme.breakpoints.down('sm')]: {
                margin: '-16px 0 0 -26px',
              },
            }}
          >
            Remove
          </Button>
        </Grid>
      ) : null}
    </Grid>
  );
});

const StyledSelect = styled(Select, { label: 'StyledSelect' })({
  marginTop: 0,
  width: '100%',
});

export default IPSharingPanel;
