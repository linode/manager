import { yupResolver } from '@hookform/resolvers/yup';
import {
  ActionsPanel,
  Box,
  Checkbox,
  Drawer,
  FormControlLabel,
  Notice,
  TextField,
  Typography,
  omittedProps,
} from '@linode/ui';
import { scrollErrorIntoViewV2 } from '@linode/utilities';
import {
  kubernetesControlPlaneACLPayloadSchema,
  kubernetesEnterpriseControlPlaneACLPayloadSchema,
} from '@linode/validation';
import { Divider, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { MultipleNonExtendedIPInput } from 'src/components/MultipleIPInput/MultipleNonExtendedIPInput';
import { NotFound } from 'src/components/NotFound';
import {
  useKubernetesClusterMutation,
  useKubernetesControlPlaneACLMutation,
} from 'src/queries/kubernetes';

import {
  ACL_DRAWER_ENTERPRISE_TIER_ACL_COPY,
  ACL_DRAWER_ENTERPRISE_TIER_ACTIVATION_STATUS_COPY,
  ACL_DRAWER_STANDARD_TIER_ACL_COPY,
  ACL_DRAWER_STANDARD_TIER_ACTIVATION_STATUS_COPY,
} from '../constants';
import { StyledACLToggle } from '../CreateCluster/ControlPlaneACLPane';

import type {
  KubernetesCluster,
  KubernetesControlPlaneACLPayload,
  KubernetesTier,
} from '@linode/api-v4';

export interface KubeControlPlaneACLDrawerProps {
  aclData: KubernetesControlPlaneACLPayload | undefined;
  closeDrawer: () => void;
  clusterId: KubernetesCluster['id'];
  clusterLabel: KubernetesCluster['label'];
  clusterMigrated: boolean;
  clusterTier: KubernetesTier;
  open: boolean;
}

export const KubeControlPlaneACLDrawer = (
  props: KubeControlPlaneACLDrawerProps
) => {
  const formContainerRef = React.useRef<HTMLFormElement>(null);
  const {
    aclData,
    closeDrawer,
    clusterId,
    clusterLabel,
    clusterMigrated,
    clusterTier,
    open,
  } = props;
  const aclPayload = aclData?.acl;

  const isEnterpriseCluster = clusterTier === 'enterprise';

  const [
    isACLAcknowledgementChecked,
    setIsACLAcknowledgementChecked,
  ] = React.useState(false);

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
    setValue,
    watch,
  } = useForm<KubernetesControlPlaneACLPayload>({
    defaultValues: aclData,
    mode: 'onBlur',
    resolver: yupResolver(
      isEnterpriseCluster && !isACLAcknowledgementChecked
        ? kubernetesEnterpriseControlPlaneACLPayloadSchema
        : kubernetesControlPlaneACLPayloadSchema
    ),
    values: {
      acl: {
        addresses: {
          ipv4: aclPayload?.addresses?.ipv4?.length
            ? aclPayload?.addresses?.ipv4
            : [''],
          ipv6: aclPayload?.addresses?.ipv6?.length
            ? aclPayload?.addresses?.ipv6
            : [''],
        },
        enabled: aclPayload?.enabled ?? false,
        'revision-id': aclPayload?.['revision-id'] ?? '',
      },
    },
  });

  const { acl } = watch();

  const shouldShowAclAcknowledgementCheck =
    isEnterpriseCluster &&
    (acl?.addresses?.ipv4?.length === 0 || acl?.addresses?.ipv4?.[0] === '') &&
    (acl?.addresses?.ipv6?.length === 0 || acl?.addresses?.ipv6?.[0] === '');

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
        ...{
          addresses: {
            ipv4,
            ipv6,
          },
        },
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
      handleClose();
    } catch (errors) {
      for (const error of errors) {
        setError(error?.field ?? 'root', { message: error.reason });
      }
      scrollErrorIntoViewV2(formContainerRef);
    }

    setIsACLAcknowledgementChecked(false);
  };

  const handleClose = () => {
    reset();
    closeDrawer();
  };

  return (
    <Drawer
      NotFoundComponent={NotFound}
      onClose={handleClose}
      open={open}
      title={`Control Plane ACL for ${clusterLabel}`}
      wide
    >
      <form onSubmit={handleSubmit(updateCluster)} ref={formContainerRef}>
        {errors.root?.message && (
          <Notice spacingTop={8} variant="error">
            {errors.root.message}
          </Notice>
        )}
        <Stack sx={{ marginTop: 3 }}>
          <StyledTypography variant="body1">
            {isEnterpriseCluster
              ? ACL_DRAWER_ENTERPRISE_TIER_ACL_COPY
              : ACL_DRAWER_STANDARD_TIER_ACL_COPY}
          </StyledTypography>
          {!clusterMigrated && (
            <Notice spacingBottom={0} spacingTop={16} variant="warning">
              <StyledTypography
                sx={(theme) => ({
                  font: theme.font.bold,
                  fontSize: '15px',
                })}
              >
                Control Plane ACL has not yet been installed on this cluster.
                During installation, it may take up to 15 minutes for the access
                control list to be fully enforced.
              </StyledTypography>
            </Notice>
          )}
          <Divider sx={{ marginBottom: 2, marginTop: 3 }} />
          <Typography variant="h3">Activation Status</Typography>
          <StyledTypography topMargin variant="body1">
            {isEnterpriseCluster
              ? ACL_DRAWER_ENTERPRISE_TIER_ACTIVATION_STATUS_COPY
              : ACL_DRAWER_STANDARD_TIER_ACTIVATION_STATUS_COPY}
          </StyledTypography>
          <Box sx={{ marginTop: 1 }}>
            <Controller
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <StyledACLToggle
                      checked={
                        isEnterpriseCluster ? true : field.value ?? false
                      }
                      onChange={() => {
                        setValue('acl.enabled', !field.value, {
                          shouldDirty: true,
                        });
                        // Disabling ACL should clear the revision-id and any addresses (see LKE-6205).
                        if (!acl.enabled) {
                          setValue('acl.revision-id', '');
                          setValue('acl.addresses.ipv6', ['']);
                          setValue('acl.addresses.ipv4', ['']);
                        } else {
                          setValue(
                            'acl.revision-id',
                            aclPayload?.['revision-id']
                          );
                          setValue(
                            'acl.addresses.ipv6',
                            aclPayload?.addresses?.ipv6?.length
                              ? aclPayload?.addresses?.ipv6
                              : ['']
                          );
                          setValue(
                            'acl.addresses.ipv4',
                            aclPayload?.addresses?.ipv4?.length
                              ? aclPayload?.addresses?.ipv4
                              : ['']
                          );
                        }
                      }}
                      disabled={isEnterpriseCluster}
                      name="ipacl-checkbox"
                      onBlur={field.onBlur}
                    />
                  }
                  label="Enable Control Plane ACL"
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
              <StyledTypography topMargin variant="body1">
                A unique identifying string for this particular revision to the
                ACL, used by clients to track events related to ACL update
                requests and enforcement. This defaults to a randomly generated
                string but can be edited if you prefer to specify your own
                string to use for tracking this change.
              </StyledTypography>
              <Controller
                render={({ field, fieldState }) => (
                  <TextField
                    disabled={!acl.enabled}
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
          <StyledTypography sx={{ marginBottom: 1 }} topMargin variant="body1">
            A list of allowed IPv4 and IPv6 addresses and CIDR ranges. This
            cluster&apos;s control plane will only be accessible from IP
            addresses within this list.
          </StyledTypography>
          {(errors.acl?.root || errors.acl?.message) && (
            <Notice spacingBottom={12} spacingTop={8} variant="error">
              {errors.acl?.root?.message}
              {errors.acl?.message}
            </Notice>
          )}
          <Box sx={{ maxWidth: 450 }}>
            <Controller
              render={({ field }) => (
                <MultipleNonExtendedIPInput
                  buttonText="Add IPv4 Address"
                  disabled={!acl.enabled}
                  ipErrors={errors.acl?.addresses?.ipv4}
                  isLinkStyled
                  nonExtendedIPs={field.value ?? ['']}
                  onBlur={field.onBlur}
                  onNonExtendedIPChange={field.onChange}
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
                    disabled={!acl.enabled}
                    ipErrors={errors.acl?.addresses?.ipv6}
                    isLinkStyled
                    nonExtendedIPs={field.value ?? ['']}
                    onBlur={field.onBlur}
                    onNonExtendedIPChange={field.onChange}
                    title="IPv6 Addresses or CIDRs"
                  />
                )}
                control={control}
                name="acl.addresses.ipv6"
              />
            </Box>
          </Box>
          {shouldShowAclAcknowledgementCheck && (
            <FormControlLabel
              control={
                <Checkbox
                  onChange={() =>
                    setIsACLAcknowledgementChecked(!isACLAcknowledgementChecked)
                  }
                  name="acl-acknowledgement"
                />
              }
              data-qa-checkbox="acl-acknowledgement"
              label="Provide an ACL later. The control plane will be unreachable until an ACL is defined."
              sx={{ marginY: 1 }}
            />
          )}
          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'update-acl-button',
              disabled: !isDirty,
              label: 'Update',
              loading: isSubmitting,
              type: 'submit',
            }}
            secondaryButtonProps={{ label: 'Cancel', onClick: handleClose }}
          />
        </Stack>
      </form>
    </Drawer>
  );
};

const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
  shouldForwardProp: omittedProps(['topMargin']),
})<{ topMargin?: boolean }>(({ theme, ...props }) => ({
  ...(props.topMargin ? { marginTop: theme.spacing(1) } : {}),
  width: '90%',
}));
