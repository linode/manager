import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { Drawer } from 'src/components/Drawer';
import { DrawerContent } from 'src/components/DrawerContent';
import { Typography } from 'src/components/Typography';
import {
  useKubernetesControlPlaneACLMutation,
  useKubernetesControlPlaneACLQuery,
  useKubernetesClusterMutation,
} from 'src/queries/kubernetes';
import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';
import {
  ExtendedIP,
  validateIPs,
  stringToExtendedIP,
} from 'src/utilities/ipUtils';
import { Checkbox } from 'src/components/Checkbox';
import { TextField } from 'src/components/TextField';
import { Stack, Divider } from '@mui/material';
import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { KubernetesControlPlaneACLPayload } from '@linode/api-v4';
import { Notice } from 'src/components/Notice/Notice';

interface Props {
  closeDrawer: () => void;
  clusterId: number;
  clusterLabel: string;
  clusterMigrated: boolean;
  open: boolean;
}

export const KubeControlPlaneACLDrawer = (props: Props) => {
  const { closeDrawer, clusterId, clusterLabel, clusterMigrated, open } = props;

  const [ipV4InputError, setIPV4InputError] = React.useState<
    string | undefined
  >('');
  const [ipV6InputError, setIPV6InputError] = React.useState<
    string | undefined
  >('');
  const [updateError, setUpdateACLError] = React.useState<string>();
  const [updating, setUpdating] = React.useState<boolean>(false);

  const {
    data: data,
    error: isErrorKubernetesACL,
    isLoading: isLoadingKubernetesACL,
    isFetching: isFetchingKubernetesACL,
    refetch: refetchKubernetesACL,
  } = useKubernetesControlPlaneACLQuery(clusterId);

  // dynamic variables mapped to JSON queried for this cluster
  const _ipv4 = data?.acl?.addresses?.ipv4?.map((ip) => {
    return stringToExtendedIP(ip);
  });

  const _ipv6 = data?.acl?.addresses?.ipv6?.map((ip) => {
    return stringToExtendedIP(ip);
  });

  const _enabled = data?.acl?.enabled;

  const _revisionID = data?.acl?.['revision-id'];

  // respective react states
  const [ipV4Addr, setIPv4Addr] = React.useState<ExtendedIP[]>([]);
  const [ipV6Addr, setIPv6Addr] = React.useState<ExtendedIP[]>([]);
  const [controlPlaneACL, setControlPlaneACL] = React.useState<boolean>(false);
  const [revisionID, setRevisionID] = React.useState<string | undefined>();

  const [submitButtonLabel, setSubmitButtonLabel] = React.useState<string>('');

  // refetchOnMount isnt good enough for this query because
  // it is already mounted in the rendered Drawer
  React.useEffect(() => {
    if (open && !isLoadingKubernetesACL && !isFetchingKubernetesACL) {
      // updates states based on queried data
      setIPv4Addr(
        _ipv4 ? _ipv4 : clusterMigrated ? [] : [stringToExtendedIP('0.0.0.0/0')]
      );
      setIPv6Addr(
        _ipv6 ? _ipv6 : clusterMigrated ? [] : [stringToExtendedIP('::/0')]
      );
      setControlPlaneACL(_enabled ? _enabled : false);
      setRevisionID(_revisionID ? _revisionID : '');
      setUpdateACLError(isErrorKubernetesACL?.[0].reason);
      setIPV4InputError(undefined);
      setIPV6InputError(undefined);
      setUpdating(false);
      setSubmitButtonLabel(clusterMigrated ? 'Update' : 'Install');
      refetchKubernetesACL();
    }
  }, [open]);

  const {
    mutateAsync: updateKubernetesClusterControlPlaneACL,
  } = useKubernetesControlPlaneACLMutation(clusterId);

  const { mutateAsync: updateKubernetesCluster } = useKubernetesClusterMutation(
    clusterId
  );

  const updateCluster = () => {
    setUpdateACLError(undefined);
    setUpdating(true);

    const _newIPv4 = ipV4Addr.map((ip) => {
      return ip.address;
    });

    const _newIPv6 = ipV6Addr.map((ip) => {
      return ip.address;
    });

    const payload: KubernetesControlPlaneACLPayload = {
      acl: {
        enabled: clusterMigrated ? controlPlaneACL : true, // new cluster installations default to true
        'revision-id': revisionID,
        addresses: { ipv4: _newIPv4, ipv6: _newIPv6 },
      },
    };

    if (clusterMigrated) {
      updateKubernetesClusterControlPlaneACL(payload)
        .then(() => {
          closeDrawer();
          setUpdating(false);
        })
        .catch((err) => {
          const regex = /(?<=\bControl\b: ).*/;
          setUpdateACLError(err[0].reason.match(regex));
          setUpdating(false);
        });
    } else {
      updateKubernetesCluster({
        control_plane: payload,
      })
        .then((_) => {
          closeDrawer();
          setUpdating(false);
        })
        .catch((err) => {
          const regex = /(?<=\bControl\b: ).*/;
          setUpdateACLError(err[0].reason.match(regex));
          setUpdating(false);
        });
    }
  };

  const ErrorMessage = () => {
    if (!!updateError && clusterMigrated) {
      return (
        <Notice spacingTop={8} variant="error">
          {updateError}
        </Notice>
      );
    }
    return <></>;
  };

  const ClusterNeedsMigration = () => {
    if (!clusterMigrated) {
      return (
        <>
          <Notice spacingTop={8} variant="error">
            IPACL is not yet installed on this cluster.... may take up to 10
            minutes or more, before ACLs are enforced...
          </Notice>
          <Divider sx={{ marginTop: 1 }} />
        </>
      );
    } else {
      return <></>;
    }
  };

  const EnabledCopy = () => {
    return (
      <>
        <Grid container>
          <Grid>
            <Typography variant="h3">Enabled</Typography>
          </Grid>
          <Grid>
            <Typography variant="body1">
              A value of true results in a default policy of DENY. A value of
              false results in a default policy of ALLOW (i.e., access controls
              are disabled). When enabled, control plane access controls can
              only be accessible through the defined IP CIDRs.
            </Typography>
          </Grid>
        </Grid>
      </>
    );
  };

  const RevisionID = () => {
    if (clusterMigrated) {
      return (
        <>
          <RevisionIDCopy />
          <TextField
            data-qa-label-input
            label="Revision ID"
            value={revisionID}
            onBlur={(e) => setRevisionID(e.target.value)}
          />
          <Divider sx={{ marginTop: 3, marginBottom: 3 }} />
        </>
      );
    } else {
      return <></>;
    }
  };

  const RevisionIDCopy = () => {
    return (
      <>
        <Grid container>
          <Grid>
            <Typography variant="h3">Revision ID</Typography>
          </Grid>
          <Grid>
            <Typography variant="body1">
              Enables clients to track events related to ACL update requests and
              enforcements. Optional field. If omitted, defaults to a randomly
              generated string.
            </Typography>
          </Grid>
        </Grid>
      </>
    );
  };

  const AddressesCopy = () => {
    return (
      <>
        <Grid>
          <Typography variant="h3">Addresses</Typography>
        </Grid>
        <Grid>
          <Typography variant="body1">
            A list of individual ipv4 and ipv6 addresses or CIDRs to ALLOW
            access to the control plane.
          </Typography>
        </Grid>
      </>
    );
  };

  return (
    <Drawer
      onClose={closeDrawer}
      open={open}
      title={'Control Plane Access Control (IPACL)'}
      wide
    >
      <DrawerContent
        error={!!isErrorKubernetesACL && clusterMigrated} // when cluster has not migrated, we expect an error from the query
        errorMessage={isErrorKubernetesACL?.[0].reason} // only on initial loading error do we disable the drawer altogether
        loading={isLoadingKubernetesACL || isFetchingKubernetesACL}
        title={clusterLabel}
      >
        <Stack sx={{ marginTop: 4 }}>
          <Grid container spacing={2}>
            <Grid>
              <Typography variant="body1">
                When a cluster is equipped with an ACL, the apiserver and
                dashboard endpoints get mapped to a NodeBalancer address where
                all traffic is protected through a Cloud Firewall.
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ marginTop: 3, marginBottom: 3 }} />

          <ClusterNeedsMigration />

          <EnabledCopy />
          <Checkbox
            checked={clusterMigrated ? controlPlaneACL : true}
            name="ipacl-checkbox"
            text={'IPACL Enabled'}
            onChange={(e) => {
              if (clusterMigrated) {
                return setControlPlaneACL(e.target.checked);
              }
            }}
          />
          <Divider sx={{ marginTop: 3, marginBottom: 3 }} />

          <RevisionID />

          <AddressesCopy />
          <MultipleIPInput
            buttonText="Add IP Address"
            ips={ipV4Addr}
            onChange={(_ips: ExtendedIP[]) => {
              const validatedIPs = validateIPs(_ips, {
                allowEmptyAddress: false,
                errorMessage: 'Must be a valid IPv4 address.',
              });
              const ipsWithErrors: ExtendedIP[] = validatedIPs.filter(
                (thisIP) => setIPV4InputError(thisIP.error)
              );
              if (ipsWithErrors.length === 0) {
                setIPv4Addr(validatedIPs);
              }
            }}
            placeholder="0.0.0.0/0"
            title="IPv4 Addresses or CIDR"
            error={ipV4InputError}
          />
          <MultipleIPInput
            buttonText="Add IP Address"
            ips={ipV6Addr}
            onChange={(_ips: ExtendedIP[]) => {
              const validatedIPs = validateIPs(_ips, {
                allowEmptyAddress: false,
                errorMessage: 'Must be a valid IPv6 address.',
              });
              const ipsWithErrors: ExtendedIP[] = validatedIPs.filter(
                (thisIP) => setIPV6InputError(thisIP.error)
              );
              if (ipsWithErrors.length === 0) {
                setIPv6Addr(validatedIPs);
              }
            }}
            placeholder="::/0"
            title="IPv6 Addresses or CIDR"
            error={ipV6InputError}
          />

          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'update-acl-button',
              disabled: !!ipV4InputError,
              label: submitButtonLabel,
              loading: updating,
              onClick: updateCluster,
              type: 'submit',
            }}
            secondaryButtonProps={{ label: 'Cancel', onClick: closeDrawer }}
          />

          <ErrorMessage />
        </Stack>
      </DrawerContent>
    </Drawer>
  );
};
