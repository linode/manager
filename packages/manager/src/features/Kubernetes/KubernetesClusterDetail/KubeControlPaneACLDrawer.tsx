import { yupResolver } from '@hookform/resolvers/yup';
import { kubernetesControlPlaneACLPayloadSchema } from '@linode/validation';
import { Divider, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Box } from 'src/components/Box';
import { Drawer } from 'src/components/Drawer';
import { DrawerContent } from 'src/components/DrawerContent';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { MultipleNonExtendedIPInput } from 'src/components/MultipleIPInput/MultipleNonExtendedIPInput';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { Toggle } from 'src/components/Toggle/Toggle';
import { Typography } from 'src/components/Typography';
import {
  useKubernetesClusterMutation,
  useKubernetesControlPlaneACLMutation,
  useKubernetesControlPlaneACLQuery,
} from 'src/queries/kubernetes';
import { scrollErrorIntoViewV2 } from 'src/utilities/scrollErrorIntoViewV2';

import type { KubernetesControlPlaneACLPayload } from '@linode/api-v4';

interface Props {
  closeDrawer: () => void;
  clusterId: number;
  clusterLabel: string;
  clusterMigrated: boolean;
  open: boolean;
  showControlPlaneACL: boolean;
}

export const KubeControlPlaneACLDrawer = (props: Props) => {
  const formContainerRef = React.useRef<HTMLFormElement>(null);
  const {
    closeDrawer,
    clusterId,
    clusterLabel,
    clusterMigrated,
    open,
    showControlPlaneACL,
  } = props;

  const {
    data: data,
    error: isErrorKubernetesACL,
    isLoading: isLoadingKubernetesACL,
  } = useKubernetesControlPlaneACLQuery(clusterId, showControlPlaneACL);

  const {
    mutateAsync: updateKubernetesClusterControlPlaneACL,
  } = useKubernetesControlPlaneACLMutation(clusterId);

  const { mutateAsync: updateKubernetesCluster } = useKubernetesClusterMutation(
    clusterId
  );

  const {
    control,
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    reset,
    setError,
    watch,
  } = useForm<KubernetesControlPlaneACLPayload>({
    defaultValues: data,
    mode: 'onBlur',
    resolver: yupResolver(kubernetesControlPlaneACLPayloadSchema),
    values: {
      acl: {
        addresses: {
          ipv4: data?.acl?.addresses?.ipv4 ?? [''],
          ipv6: data?.acl?.addresses?.ipv6 ?? [''],
        },
        enabled: data?.acl?.enabled ?? false,
        'revision-id': data?.acl?.['revision-id'] ?? '',
      },
    },
  });

  const { acl } = watch();

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

    const ipv4 = acl.addresses?.ipv4
      ? acl.addresses.ipv4.filter((ip) => ip !== '')
      : [];

    const ipv6 = acl.addresses?.ipv6
      ? acl.addresses.ipv6.filter((ip) => ip !== '')
      : [];

    const payload: KubernetesControlPlaneACLPayload = {
      acl: {
        enabled: acl.enabled,
        'revision-id': acl['revision-id'],
        ...((ipv4.length > 0 || ipv6.length > 0) && {
          addresses: {
            ...(ipv4.length > 0 && { ipv4 }),
            ...(ipv6.length > 0 && { ipv6 }),
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
        setError(error?.field ?? 'root', { message: error.reason });
      }
      scrollErrorIntoViewV2(formContainerRef);
    }
  };

  return (
    <Drawer
      onClose={closeDrawer}
      onExited={() => reset()}
      open={open}
      title={'Control Plane ACL'}
      wide
    >
      <DrawerContent
        error={!!isErrorKubernetesACL && clusterMigrated} // when cluster has not migrated, we expect an error from the query
        errorMessage={isErrorKubernetesACL?.[0].reason} // only on initial loading error do we disable the drawer altogether
        loading={isLoadingKubernetesACL}
        title={clusterLabel}
      >
        <form onSubmit={handleSubmit(updateCluster)} ref={formContainerRef}>
          {errors.root?.message && (
            <Notice spacingTop={8} variant="error">
              {errors.root.message}
            </Notice>
          )}
          <Stack sx={{ marginTop: 3 }}>
            <StyledTypography variant="body1">
              Control Plane ACL secures network access to your LKE
              cluster&apos;s control plane. Use this form to enable or disable
              the ACL on your LKE cluster, update the list of allowed IP
              addresses, and adjust other settings.
            </StyledTypography>
            <Divider sx={{ marginBottom: 2, marginTop: 3 }} />
            <Typography variant="h3">Activation Status</Typography>
            <StyledTypography variant="body1">
              Enable or disable the Control Plane ACL. If the ACL is not
              enabled, any public IP address can be used to access your control
              plane. Once enabled, all network access is denied except for the
              IP addresses and CIDR ranges defined on the ACL.
            </StyledTypography>
            <Box sx={{ marginTop: 1 }}>
              <Controller
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Toggle
                        checked={field.value ?? false}
                        name="ipacl-checkbox"
                        onBlur={field.onBlur}
                        onChange={field.onChange}
                      />
                    }
                    label={'Enable Control Plane ACL'}
                  />
                )}
                control={control}
                name="acl.enabled"
              />
            </Box>
            <Divider sx={{ marginBottom: 3, marginTop: 1.5 }} />
            {clusterMigrated && (
              <>
                <Typography variant="h3">Revision ID</Typography>
                <StyledTypography variant="body1">
                  A unique identifing string for this particular revision to the
                  ACL, used by clients to track events related to ACL update
                  requests and enforcement. This defaults to a randomly
                  generated string but can be edited if you prefer to specify
                  your own string to use for tracking this change.
                </StyledTypography>
                <Controller
                  render={({ field, fieldState }) => (
                    <TextField
                      errorText={fieldState.error?.message}
                      label="Revision ID"
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                      value={field.value}
                    />
                  )}
                  control={control}
                  name="acl.revision-id"
                />
                <Divider sx={{ marginBottom: 3, marginTop: 3 }} />
              </>
            )}
            <Typography variant="h3">Addresses</Typography>
            <StyledTypography sx={{ marginBottom: 1 }} variant="body1">
              A list of allowed IPv4 and IPv6 addresses and CIDR ranges. This
              cluster&apos;s control plane will only be accessible from IP
              addresses within this list.
            </StyledTypography>
            {errors.acl?.message && (
              <Notice spacingBottom={12} spacingTop={8} variant="error">
                {errors.acl.message}
              </Notice>
            )}
            <Box sx={{ maxWidth: 450 }}>
              <Controller
                render={({ field }) => (
                  <MultipleNonExtendedIPInput
                    buttonText="Add IPv4 Address"
                    ipErrors={errors.acl?.addresses?.ipv4}
                    isLinkStyled
                    nonExtendedIPs={field.value ?? ['']}
                    onBlur={field.onBlur}
                    onNonExtendedIPChange={field.onChange}
                    placeholder="0.0.0.0/0"
                    title="IPv4 Addresses or CIDRs"
                  />
                )}
                control={control}
                name="acl.addresses.ipv4"
              />
              <Box marginTop={2}>
                <Controller
                  render={({ field }) => (
                    <MultipleNonExtendedIPInput
                      buttonText="Add IPv6 Address"
                      ipErrors={errors.acl?.addresses?.ipv6}
                      isLinkStyled
                      nonExtendedIPs={field.value ?? ['']}
                      onBlur={field.onBlur}
                      onNonExtendedIPChange={field.onChange}
                      placeholder="::/0"
                      title="IPv6 Addresses or CIDRs"
                    />
                  )}
                  control={control}
                  name="acl.addresses.ipv6"
                />
              </Box>
            </Box>
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
                <StyledTypography>
                  Control Plane ACL has not yet been installed on this cluster.
                  During installation, it may take up to 15 minutes for the
                  access control list to be fully enforced.
                </StyledTypography>
              </Notice>
            )}
          </Stack>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

const StyledTypography = styled(Typography, { label: 'StyledTypography' })({
  width: '90%',
});
