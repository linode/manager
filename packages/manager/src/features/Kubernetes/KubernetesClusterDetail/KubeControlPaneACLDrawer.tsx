import { Box } from '@mui/material';
import { Divider, Stack } from '@mui/material';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { DrawerContent } from 'src/components/DrawerContent';
import { FormControlLabel } from 'src/components/FormControlLabel';
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

import { ControlPlaneACLIPInputs } from '../CreateCluster/ControlPlaneACLIPInputs';

import type { KubernetesControlPlaneACLPayload } from '@linode/api-v4';
import type { ExtendedIP } from 'src/utilities/ipUtils';

type IPACLDrawerFormState = {
  acl: IPACLDrawerACLState;
};

type IPACLDrawerACLState = {
  enabled: boolean;
  ipv4: ExtendedIP[];
  ipv6: ExtendedIP[];
  'revision-id': string;
};

interface Props {
  closeDrawer: () => void;
  clusterId: number;
  clusterLabel: string;
  clusterMigrated: boolean;
  open: boolean;
}

export const KubeControlPlaneACLDrawer = (props: Props) => {
  const { closeDrawer, clusterId, clusterLabel, clusterMigrated, open } = props;

  const {
    data: data,
    error: isErrorKubernetesACL,
    isLoading: isLoadingKubernetesACL,
  } = useKubernetesControlPlaneACLQuery(clusterId);

  const {
    mutateAsync: updateKubernetesClusterControlPlaneACL,
  } = useKubernetesControlPlaneACLMutation(clusterId);

  const { mutateAsync: updateKubernetesCluster } = useKubernetesClusterMutation(
    clusterId
  );

  const ipv4 = data?.acl?.addresses?.ipv4?.map((ip) => {
    return stringToExtendedIP(ip);
  }) ?? [stringToExtendedIP('')];
  const ipv6 = data?.acl?.addresses?.ipv6?.map((ip) => {
    return stringToExtendedIP(ip);
  }) ?? [stringToExtendedIP('')];

  const initialValues: IPACLDrawerFormState = {
    acl: {
      enabled: data?.acl?.enabled ?? false,
      ipv4,
      ipv6,
      'revision-id': data?.acl?.['revision-id'] ?? '',
    },
  };

  const {
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
  } = useForm<IPACLDrawerFormState>({
    defaultValues: initialValues,
    values: {
      ...initialValues,
    },
  });

  const values = watch();
  const { acl } = values;

  const updateCluster = async () => {
    // A quick note on the following code:
    //
    //   - A non-IPACL'd cluster (denominated 'traditional') does not have IPACLs natively.
    //     The customer must then install IPACL (or 'migrate') on this cluster.
    //     This is done through a call to the updateKubernetesCluster endpoint.
    //     Only after a migration will the call to the updateKubernetesClusterControlPlaneACL
    //     endpoint be accepted.
    //
    //     Do note that all new clusters automatically have IPACLs installed (even if the customer
    //     chooses to disable it during creation).
    //
    //     For this reason, further in this code, we check whether the cluster has migrated or not
    //     before choosing which endpoint to use.
    //
    //   - The address stanza of the JSON payload is optional. If provided though, that stanza must
    //     contain either/or/both IPv4 and IPv6. This is why there is additional code to properly
    //     check whether either exists, and only if they do, do we provide the addresses stanza
    //     to the payload
    //
    //   - Hopefully this explains the behavior of this code, and why one must be very careful
    //     before introducing any clever/streamlined code - there's a reason to the mess :)
    //
    if (acl.ipv4.some((ip) => ip.error) || acl.ipv6.some((ip) => ip.error)) {
      return;
    }

    const _ipv4 = acl.ipv4
      .map((ip) => {
        return ip.address;
      })
      .filter((ip) => ip != '');

    const _ipv6 = acl.ipv6
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
        enabled: acl.enabled,
        'revision-id': acl['revision-id'],
        ...((_ipv4.length > 0 || _ipv6.length > 0) && {
          addresses: {
            ...addressIPv4Payload,
            ...addressIPv6Payload,
          },
        }),
      },
    };

    try {
      if (clusterMigrated) {
        await updateKubernetesClusterControlPlaneACL(payload);
      } else {
        await updateKubernetesCluster({
          control_plane: payload,
        });
      }
      closeDrawer();
    } catch (errors) {
      for (const error of errors) {
        if (error.field) {
          setError(error.field, { message: error.message });
        } else {
          setError('root', { message: error.message });
        }
      }
    }
  };

  return (
    <Drawer
      onClose={closeDrawer}
      onExited={() => reset()}
      open={open}
      title={'Control Plane Access Control List'}
      wide
    >
      <DrawerContent
        error={!!isErrorKubernetesACL && clusterMigrated} // when cluster has not migrated, we expect an error from the query
        errorMessage={isErrorKubernetesACL?.[0].reason} // only on initial loading error do we disable the drawer altogether
        loading={isLoadingKubernetesACL}
        title={clusterLabel}
      >
        <form onSubmit={handleSubmit(updateCluster)}>
          {errors.root?.message && (
            <Notice spacingTop={8} variant="error">
              {errors.root.message}
            </Notice>
          )}
          <Stack sx={{ marginTop: 3 }}>
            <Typography variant="body1">
              When a cluster is equipped with an ACL, the apiserver and
              dashboard endpoints get mapped to a NodeBalancer address where all
              traffic is protected through a Cloud Firewall.
            </Typography>
            <Divider sx={{ marginBottom: 2, marginTop: 3 }} />
            <Typography variant="h3">Enabled</Typography>
            <Typography variant="body1">
              A value of true results in a default policy of DENY. A value of
              false results in a default policy of ALLOW (i.e., access controls
              are disabled). When enabled, control plane access controls can
              only be accessible through the defined IP CIDRs.
            </Typography>
            <Box sx={{ marginTop: 1 }}>
              <FormControlLabel
                control={
                  <Toggle
                    onChange={(e) => {
                      setValue('acl.enabled', e.target.checked, {
                        shouldDirty: true,
                      });
                    }}
                    checked={acl.enabled ?? false}
                    name="ipacl-checkbox"
                  />
                }
                label={'IPACL Enabled'}
              />
            </Box>
            <Divider sx={{ marginBottom: 3, marginTop: 1.5 }} />
            {clusterMigrated && (
              <>
                <Typography variant="h3">Revision ID</Typography>
                <Typography variant="body1">
                  Enables clients to track events related to ACL update requests
                  and enforcements. Optional field. If omitted, defaults to a
                  randomly generated string.
                </Typography>
                <TextField
                  onBlur={(e) =>
                    setValue('acl.revision-id', e.target.value, {
                      shouldDirty: true,
                    })
                  }
                  data-qa-label-input
                  label="Revision ID"
                  value={acl['revision-id']}
                />
                <Divider sx={{ marginBottom: 3, marginTop: 3 }} />
              </>
            )}
            <Typography variant="h3">Addresses</Typography>
            <Typography sx={{ marginBottom: 1 }} variant="body1">
              A list of individual ipv4 and ipv6 addresses or CIDRs to ALLOW
              access to the control plane.
            </Typography>
            {errors.acl?.message && clusterMigrated && (
              <Notice spacingTop={8} variant="error">
                {errors.acl.message}
              </Notice>
            )}
            <ControlPlaneACLIPInputs
              handleIPv4Blur={(ips: ExtendedIP[]) =>
                setValue(
                  'acl.ipv4',
                  validateIPs(ips, {
                    allowEmptyAddress: false,
                    errorMessage: 'Must be a valid IPv4 address.',
                  })
                )
              }
              handleIPv4Change={(ips: ExtendedIP[]) =>
                setValue('acl.ipv4', ips, { shouldDirty: true })
              }
              handleIPv6Blur={(ips: ExtendedIP[]) =>
                setValue(
                  'acl.ipv6',
                  validateIPs(ips, {
                    allowEmptyAddress: false,
                    errorMessage: 'Must be a valid IPv4 address.',
                  })
                )
              }
              handleIPv6Change={(ips: ExtendedIP[]) =>
                setValue('acl.ipv6', ips, { shouldDirty: true })
              }
              ipV4Addr={acl.ipv4}
              ipV6Addr={acl.ipv6}
            />
            <ActionsPanel
              primaryButtonProps={{
                'data-testid': 'update-acl-button',
                disabled: !isDirty,
                label: 'Update',
                loading: isSubmitting,
                type: 'submit',
              }}
              secondaryButtonProps={{ label: 'Cancel', onClick: closeDrawer }}
            />
            {!clusterMigrated && (
              <Notice spacingTop={24} variant="warning">
                IPACL has not yet been installed on this cluster. During
                installation, it may take up to 20 minutes before ACLs are fully
                enforced for the first time.
              </Notice>
            )}
          </Stack>
        </form>
      </DrawerContent>
    </Drawer>
  );
};
