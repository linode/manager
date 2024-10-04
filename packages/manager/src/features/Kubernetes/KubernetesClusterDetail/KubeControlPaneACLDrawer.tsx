import { Divider, Stack } from '@mui/material';
import { Box } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { DrawerContent } from 'src/components/DrawerContent';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { Toggle } from 'src/components/Toggle/Toggle';
import { Typography } from 'src/components/Typography';
import {
  useKubernetesClusterMutation,
  useKubernetesControlPlaneACLMutation,
  useKubernetesControlPlaneACLQuery,
} from 'src/queries/kubernetes';
import { stringToExtendedIP, validateIPs } from 'src/utilities/ipUtils';

import type { KubernetesControlPlaneACLPayload } from '@linode/api-v4';
import type { ExtendedIP } from 'src/utilities/ipUtils';

interface Props {
  closeDrawer: () => void;
  clusterId: number;
  clusterLabel: string;
  clusterMigrated: boolean;
  open: boolean;
}

export const KubeControlPlaneACLDrawer = (props: Props) => {
  const { closeDrawer, clusterId, clusterLabel, clusterMigrated, open } = props;

  const [updateError, setUpdateACLError] = React.useState<string>();
  const [updating, setUpdating] = React.useState<boolean>(false);

  const {
    data: data,
    error: isErrorKubernetesACL,
    isFetching: isFetchingKubernetesACL,
    isLoading: isLoadingKubernetesACL,
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

  const _hideEnableFromUI = !clusterMigrated || !_enabled;

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
      setIPv4Addr(_ipv4 ? _ipv4 : [stringToExtendedIP('')]);
      setIPv6Addr(_ipv6 ? _ipv6 : [stringToExtendedIP('')]);
      setControlPlaneACL(_enabled ? _enabled : false);
      setRevisionID(_revisionID ? _revisionID : '');
      setUpdateACLError(isErrorKubernetesACL?.[0].reason);
      setUpdating(false);
      setSubmitButtonLabel(
        _hideEnableFromUI
          ? 'Enable IPACL'
          : clusterMigrated
          ? 'Update IPACL'
          : 'Install IPACL'
      );
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

    const _ipv4 = ipV4Addr
      .map((ip) => {
        return ip.address;
      })
      .filter((ip) => ip != '');

    const _ipv6 = ipV6Addr
      .map((ip) => {
        return ip.address;
      })
      .filter((ip) => ip != '');

    const addressIPv4Payload = {
      ...(_ipv4.length > 0 && { ipv4: _ipv4 }),
    };

    const addressIPv6Payload = {
      ...(_ipv6.length > 0 && { ipv6: _ipv6 }),
    };

    const payload: KubernetesControlPlaneACLPayload = {
      acl: {
        enabled: _hideEnableFromUI ? true : controlPlaneACL, // both new cluster installations as well as all the states where the UI disabled the option for the user to enable, we default to true
        'revision-id': revisionID,
        ...((_ipv4.length > 0 || _ipv6.length > 0) && {
          addresses: {
            ...addressIPv4Payload,
            ...addressIPv6Payload,
          },
        }),
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

  const handleIPv4ChangeCB = React.useCallback(
    (_ips: ExtendedIP[]) => {
      setIPv4Addr(_ips);
    },
    [setIPv4Addr]
  );

  const handleIPv6ChangeCB = React.useCallback(
    (_ips: ExtendedIP[]) => {
      setIPv6Addr(_ips);
    },
    [setIPv6Addr]
  );

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
        <Notice spacingTop={24} variant="warning">
          IPACL has not yet been installed on this cluster. During installation,
          it may take up to 20 minutes before ACLs are fully enforced for the
          first time.
        </Notice>
      );
    } else {
      return <></>;
    }
  };

  const EnabledCopy = () => {
    return (
      <Grid container>
        <Grid>
          <Typography variant="h3">Enabled</Typography>
        </Grid>
        <Grid>
          <Typography variant="body1">
            A value of true results in a default policy of DENY. A value of
            false results in a default policy of ALLOW (i.e., access controls
            are disabled). When enabled, control plane access controls can only
            be accessible through the defined IP CIDRs.
          </Typography>
        </Grid>
      </Grid>
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
            onBlur={(e) => setRevisionID(e.target.value)}
            value={revisionID}
          />
          <Divider sx={{ marginBottom: 3, marginTop: 3 }} />
        </>
      );
    } else {
      return <></>;
    }
  };

  const RevisionIDCopy = () => {
    return (
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
    );
  };

  const AddressesCopy = () => {
    return (
      <>
        <Grid>
          <Typography variant="h3">Addresses</Typography>
        </Grid>
        <Grid sx={{ marginBottom: 1 }}>
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
          <Divider sx={{ marginBottom: 2, marginTop: 3 }} />

          {!_hideEnableFromUI && (
            <>
              <EnabledCopy />
              <Box sx={{ marginTop: 2 }}>
                <FormControlLabel
                  control={
                    <Toggle
                      onChange={(e) => {
                        if (clusterMigrated) {
                          return setControlPlaneACL(e.target.checked);
                        }
                      }}
                      checked={clusterMigrated ? controlPlaneACL : true}
                      name="ipacl-checkbox"
                    />
                  }
                  label={'IPACL Enabled'}
                />
              </Box>
              <Divider sx={{ marginBottom: 3, marginTop: 3 }} />
            </>
          )}
          <RevisionID />
          <AddressesCopy />
          <ErrorMessage />
          <Box sx={{ maxWidth: 450 }}>
            <MultipleIPInput
              onBlur={(_ips: ExtendedIP[]) => {
                const validatedIPs = validateIPs(_ips, {
                  allowEmptyAddress: false,
                  errorMessage: 'Must be a valid IPv4 address.',
                });
                handleIPv4ChangeCB(validatedIPs);
              }}
              buttonText="Add IPv4 Address"
              ips={ipV4Addr}
              isLinkStyled
              onChange={handleIPv4ChangeCB}
              placeholder="0.0.0.0/0"
              title="IPv4 Addresses or CIDRs"
            />
            <Box marginTop={2}>
              <MultipleIPInput
                onBlur={(_ips: ExtendedIP[]) => {
                  const validatedIPs = validateIPs(_ips, {
                    allowEmptyAddress: false,
                    errorMessage: 'Must be a valid IPv6 address.',
                  });
                  handleIPv6ChangeCB(validatedIPs);
                }}
                buttonText="Add IPv6 Address"
                ips={ipV6Addr}
                isLinkStyled
                onChange={handleIPv6ChangeCB}
                placeholder="::/0"
                title="IPv6 Addresses or CIDRs"
              />
            </Box>
          </Box>
          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'update-acl-button',
              label: submitButtonLabel,
              loading: updating,
              onClick: updateCluster,
              type: 'submit',
            }}
            secondaryButtonProps={{ label: 'Cancel', onClick: closeDrawer }}
          />
          <ClusterNeedsMigration />
        </Stack>
      </DrawerContent>
    </Drawer>
  );
};
