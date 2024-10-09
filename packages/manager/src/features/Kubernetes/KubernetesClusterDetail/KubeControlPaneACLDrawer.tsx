import { Divider, Stack } from '@mui/material';
import { Box } from '@mui/material';
import * as React from 'react';
import { useForm } from 'react-hook-form';

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

// wondering if I should get the data from a parent component instead?

export const KubeControlPlaneACLDrawer = (props: Props) => {
  const { closeDrawer, clusterId, clusterLabel, clusterMigrated, open } = props;

  const {
    data: data,
    error: isErrorKubernetesACL,
    isFetching: isFetchingKubernetesACL,
    isLoading: isLoadingKubernetesACL,
    // refetch: refetchKubernetesACL,
  } = useKubernetesControlPlaneACLQuery(clusterId);

  const ipv4 = data?.acl?.addresses?.ipv4?.map((ip) => {
    return stringToExtendedIP(ip);
  });
  const ipv6 = data?.acl?.addresses?.ipv6?.map((ip) => {
    return stringToExtendedIP(ip);
  });
  const enabled = data?.acl?.enabled;
  const revisionID = data?.acl?.['revision-id'];

  const enabledExists = enabled !== undefined;
  const shouldDefaultToEnabled = !clusterMigrated || !enabled;

  // check if we really want this?
  // refetchOnMount isnt good enough for this query because
  // it is already mounted in the rendered Drawer
  // React.useEffect(() => {
  //   if (open && !isLoadingKubernetesACL && !isFetchingKubernetesACL) {
  //     refetchKubernetesACL(); // makes it fetch again
  //   }
  // }, [open]);

  const {
    mutateAsync: updateKubernetesClusterControlPlaneACL,
  } = useKubernetesControlPlaneACLMutation(clusterId);

  const { mutateAsync: updateKubernetesCluster } = useKubernetesClusterMutation(
    clusterId
  );

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
  } = useForm({
    // need to make this eventually match the shape of KubernetesControlPlaneACLPayload hopefully
    // defaultValues: {
    //   enabled: !!enabled,
    //   ipv4: ipv4 ?? [stringToExtendedIP('')],
    //   ipv6: ipv6 ?? [stringToExtendedIP('')],
    //   'revision-id': revisionID,
    // },
    values: {
      enabled: !!enabled,
      ipv4: ipv4 ?? [stringToExtendedIP('')],
      ipv6: ipv6 ?? [stringToExtendedIP('')],
      'revision-id': revisionID,
    },
  });

  const values = watch();

  const updateCluster = handleSubmit(() => {
    const _ipv4 = values.ipv4
      .map((ip) => {
        return ip.address;
      })
      .filter((ip) => ip != '');

    const _ipv6 = values.ipv6
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
        enabled: enabledExists
          ? values.enabled
          : shouldDefaultToEnabled || values.enabled, // both new cluster installations as well as all the states where the UI disabled the option for the user to enable, we default to true
        'revision-id': values['revision-id'],
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
        updateKubernetesClusterControlPlaneACL(payload);
      } else {
        updateKubernetesCluster({
          control_plane: payload,
        });
      }
      closeDrawer();
    } catch (errors) {
      // .catch((err) => {
      //   const regex = /(?<=\bControl\b: ).*/;
      //   setUpdateACLError(err[0].reason.match(regex));
      // });
      for (const error of errors) {
        if (error.field) {
          setError(error.field, { message: error.reason });
        } else {
          setError('root', { message: error.reason });
        }
      }
    }
  });

  return (
    <Drawer
      onClose={closeDrawer}
      onExited={() => reset()}
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
          <Typography variant="body1">
            When a cluster is equipped with an ACL, the apiserver and dashboard
            endpoints get mapped to a NodeBalancer address where all traffic is
            protected through a Cloud Firewall.
          </Typography>
          <Divider sx={{ marginBottom: 2, marginTop: 3 }} />
          {enabledExists && (
            <>
              <Typography variant="h3">Enabled</Typography>
              <Typography variant="body1">
                A value of true results in a default policy of DENY. A value of
                false results in a default policy of ALLOW (i.e., access
                controls are disabled). When enabled, control plane access
                controls can only be accessible through the defined IP CIDRs.
              </Typography>
              <Box sx={{ marginTop: 1 }}>
                <FormControlLabel
                  control={
                    <Toggle
                      onChange={(e) => {
                        if (clusterMigrated) {
                          setValue('enabled', e.target.checked);
                        }
                      }}
                      checked={clusterMigrated ? values.enabled : true}
                      name="ipacl-checkbox"
                    />
                  }
                  label={'IPACL Enabled'}
                />
              </Box>
              <Divider sx={{ marginBottom: 3, marginTop: 1.5 }} />
            </>
          )}
          {clusterMigrated && (
            <>
              <Typography variant="h3">Revision ID</Typography>
              <Typography variant="body1">
                Enables clients to track events related to ACL update requests
                and enforcements. Optional field. If omitted, defaults to a
                randomly generated string.
              </Typography>
              <TextField
                data-qa-label-input
                label="Revision ID"
                onBlur={(e) => setValue('revision-id', e.target.value)}
                value={values['revision-id']}
              />
              <Divider sx={{ marginBottom: 3, marginTop: 3 }} />
            </>
          )}
          <Typography variant="h3">Addresses</Typography>
          <Typography sx={{ marginBottom: 1 }} variant="body1">
            A list of individual ipv4 and ipv6 addresses or CIDRs to ALLOW
            access to the control plane.
          </Typography>
          {/* I am not sure if this matches - will need to check */}
          {errors.root?.message && clusterMigrated && (
            <Notice spacingTop={8} variant="error">
              {errors.root.message}
            </Notice>
          )}
          <Box sx={{ maxWidth: 450 }}>
            <MultipleIPInput
              onBlur={(ips: ExtendedIP[]) =>
                setValue(
                  'ipv4',
                  validateIPs(ips, {
                    allowEmptyAddress: false,
                    errorMessage: 'Must be a valid IPv4 address.',
                  })
                )
              }
              buttonText="Add IPv4 Address"
              ips={values.ipv4}
              isLinkStyled
              onChange={(ips: ExtendedIP[]) => setValue('ipv4', ips)}
              placeholder="0.0.0.0/0"
              title="IPv4 Addresses or CIDRs"
            />
            <Box marginTop={2}>
              <MultipleIPInput
                onBlur={(ips: ExtendedIP[]) =>
                  setValue(
                    'ipv6',
                    validateIPs(ips, {
                      allowEmptyAddress: false,
                      errorMessage: 'Must be a valid IPv4 address.',
                    })
                  )
                }
                buttonText="Add IPv6 Address"
                ips={values.ipv6}
                isLinkStyled
                onChange={(ips: ExtendedIP[]) => setValue('ipv6', ips)}
                placeholder="::/0"
                title="IPv6 Addresses or CIDRs"
              />
            </Box>
          </Box>
          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'update-acl-button',
              label: enabledExists ? 'Update IPACL' : 'Install IPACL',
              loading: isSubmitting,
              onClick: updateCluster,
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
      </DrawerContent>
    </Drawer>
  );
};
