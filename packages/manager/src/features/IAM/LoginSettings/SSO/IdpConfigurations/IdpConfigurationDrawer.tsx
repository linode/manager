import { toast } from '@akamai/cds-components/notification-toast';
import {
  Button,
  FormError,
  FormField,
  FormLabel,
  NotificationBanner,
  TextField,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  useCreateIdpConfigMutation,
  useUpdateIdpConfigMutation,
} from '@linode/queries';
import {
  CreateIdpConfigSchema,
  UpdateIdpConfigSchema,
} from '@linode/validation';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';

import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { Drawer, DrawerInlineActions } from '../../../Shared/Drawer';
import {
  ALL_CERTIFICATES_DELETED_ERROR,
  CREATE_SUCCESS,
  IAM_CREATE_IDP_PENDO_IDS,
  IAM_EDIT_IDP_PENDO_IDS,
  IDENTITY_PROVIDER_DESCRIPTION,
  UPDATE_SUCCESS,
} from '../../constants';
import { AttributeMappingSection } from './AttributeMappingSection';
import { CertificatesSection } from './CertificatesSection';
import styles from './IdpConfigurationDrawer.module.css';
import { defaultValues } from './idpConfigurationDrawer.utils';

import type { DrawerMode } from './idpConfigurationDrawer.utils';
import type { CreateIdpConfigPayload, IdpConfig } from '@linode/api-v4';

interface Props {
  idpConfig?: IdpConfig;
  mode: DrawerMode;
  onClose: () => void;
  open: boolean;
}

export const IdpConfigurationDrawer = ({
  idpConfig,
  mode,
  onClose,
  open,
}: Props) => {
  const { mutateAsync: createIdpConfig, isPending: isCreatingIdpConfig } =
    useCreateIdpConfigMutation();
  const { mutateAsync: updateIdpConfig, isPending: isUpdatingIdpConfig } =
    useUpdateIdpConfigMutation(idpConfig?.id ?? '');
  const isSMUp = useBreakpoint('up', 'sm');

  const isEdit = mode === 'edit';
  const title = isEdit ? 'Edit IDP Configuration' : 'Create IDP Configuration';

  const [deletedCertificateIds, setDeletedCertificateIds] = React.useState<
    Set<string>
  >(new Set());

  const notificationBannerRef = React.useRef<HTMLDivElement>(null);

  const handleToggleDeleteCertificate = (id: string) => {
    setDeletedCertificateIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const editValues =
    isEdit && idpConfig
      ? {
          default: idpConfig.default,
          enabled: idpConfig.enabled,
          enforce: idpConfig.enforce,
          label: idpConfig.label,
          saml: {
            entity_id: idpConfig.saml.entity_id,
            identity_element: idpConfig.saml.identity_element,
            idp_url: idpConfig.saml.idp_url,
            public_certificates:
              idpConfig.saml.public_certificates.length === 0
                ? [{ certificate: '' }]
                : ([] as { certificate: string }[]),
            user_id_attribute: idpConfig.saml.user_id_attribute ?? '',
          },
        }
      : undefined;

  const {
    control,
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    reset,
    setError,
    watch,
  } = useForm<CreateIdpConfigPayload>({
    context: {
      existingCerts:
        isEdit && idpConfig
          ? idpConfig.saml.public_certificates.filter(
              (cert) => !deletedCertificateIds.has(cert.id)
            )
          : [],
    },
    defaultValues,
    resolver: yupResolver(
      isEdit ? UpdateIdpConfigSchema : CreateIdpConfigSchema
    ) as Resolver<CreateIdpConfigPayload>,
    values: editValues,
  });

  const onSubmit = async (formValues: CreateIdpConfigPayload) => {
    const payload = {
      ...formValues,
      saml: { ...formValues.saml },
    };

    // API rejects user_id_attribute when identity_element is 'name_id'
    if (payload.saml.identity_element === 'name_id') {
      delete payload.saml.user_id_attribute;
    }
    // In edit mode, check that not all existing certs are deleted
    // unless new ones are being added
    if (isEdit && idpConfig) {
      const existingCerts = idpConfig.saml.public_certificates;
      const remainingExisting = existingCerts.filter(
        (cert) => !deletedCertificateIds.has(cert.id)
      );
      const newCerts = formValues.saml.public_certificates.filter(
        (cert) => cert.certificate.trim() !== ''
      );

      if (remainingExisting.length === 0 && newCerts.length === 0) {
        setError('root', {
          message: ALL_CERTIFICATES_DELETED_ERROR,
        });
        return;
      }

      // Build the certificates payload: keep non-deleted existing + add new
      payload.saml.public_certificates = [
        ...remainingExisting.map((cert) => ({
          certificate: cert.certificate,
        })),
        ...newCerts,
      ];
    }

    try {
      if (isEdit) {
        await updateIdpConfig(payload);
      } else {
        await createIdpConfig(payload);
      }
      toast.open({
        text: isEdit ? UPDATE_SUCCESS : CREATE_SUCCESS,
        type: 'success',
      });
      handleClose();
    } catch (errors) {
      const apiErrors = Array.isArray(errors) ? errors : [];

      for (const error of apiErrors) {
        const field = error.field;
        let errorMessage = error.reason;

        // Override error message for expired certificates
        if (errorMessage?.toLowerCase().includes('expired')) {
          errorMessage =
            "An IDP configuration can't be created or updated with expired certificate(s).";
        }

        if (field?.startsWith('saml.public_certificates')) {
          setError('root', { message: errorMessage });
          continue;
        }

        setError(field ?? 'root', { message: errorMessage });
      }

      requestAnimationFrame(() => {
        notificationBannerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      });
    }
  };

  const handleClose = () => {
    reset();
    setDeletedCertificateIds(new Set());
    onClose();
  };

  const hasChanges = isDirty || (isEdit && deletedCertificateIds.size > 0);

  const allExistingCertsDeleted =
    isEdit &&
    idpConfig !== undefined &&
    idpConfig.saml.public_certificates.length > 0 &&
    idpConfig.saml.public_certificates.every((cert) =>
      deletedCertificateIds.has(cert.id)
    );

  const newCertificates = watch('saml.public_certificates') ?? [];

  const isSaveDisabled =
    !hasChanges || (allExistingCertsDeleted && newCertificates.length === 0);

  return (
    <Drawer
      aria-label={title}
      onClose={handleClose}
      open={open}
      width={isSMUp ? (isEdit ? '616px' : '480px') : '100%'}
    >
      <div slot="header">{title}</div>
      <form noValidate onSubmit={handleSubmit(onSubmit)} slot="body">
        {errors.root?.message && (
          <div ref={notificationBannerRef}>
            <NotificationBanner
              style={{ marginBottom: Spacing.S12 }}
              text={errors.root?.message}
              type="error"
            />
          </div>
        )}
        <Controller
          control={control}
          name="label"
          render={({ field, fieldState }) => (
            <FormField
              error={!!fieldState.error}
              label-position="top"
              style={{ padding: 0 }}
            >
              <FormLabel slot="label">Label</FormLabel>
              <TextField
                data-pendo-id={
                  isEdit
                    ? IAM_EDIT_IDP_PENDO_IDS.label
                    : IAM_CREATE_IDP_PENDO_IDS.label
                }
                onChange={field.onChange}
                placeholder="Enter a label"
                value={field.value}
              />
              {fieldState.error && (
                <FormError>{fieldState.error.message}</FormError>
              )}
            </FormField>
          )}
        />

        <div className={styles.sectionHeading}>Identity Provider Details</div>
        <p className={styles.sectionDescription}>
          {IDENTITY_PROVIDER_DESCRIPTION}
        </p>

        <Controller
          control={control}
          name="saml.entity_id"
          render={({ field, fieldState }) => (
            <FormField
              className={styles.formFieldTextSpaced}
              error={!!fieldState.error}
              label-position="top"
            >
              <FormLabel slot="label">Entity ID</FormLabel>
              <TextField
                data-pendo-id={
                  isEdit
                    ? IAM_EDIT_IDP_PENDO_IDS.entityID
                    : IAM_CREATE_IDP_PENDO_IDS.entityID
                }
                onChange={field.onChange}
                placeholder="Enter an entity ID"
                value={field.value}
              />
              {fieldState.error && (
                <FormError>{fieldState.error.message}</FormError>
              )}
            </FormField>
          )}
        />

        <Controller
          control={control}
          name="saml.idp_url"
          render={({ field, fieldState }) => (
            <FormField
              className={styles.formFieldTextSpaced}
              error={!!fieldState.error}
              label-position="top"
            >
              <FormLabel slot="label">IDP URL</FormLabel>
              <TextField
                data-pendo-id={
                  isEdit
                    ? IAM_EDIT_IDP_PENDO_IDS.idpURL
                    : IAM_CREATE_IDP_PENDO_IDS.idpURL
                }
                onChange={field.onChange}
                placeholder="Enter an IDP URL"
                value={field.value}
              />
              {fieldState.error && (
                <FormError>{fieldState.error.message}</FormError>
              )}
            </FormField>
          )}
        />

        {!isEdit && <CertificatesSection control={control} />}

        {isEdit && idpConfig && (
          <CertificatesSection
            certificates={idpConfig.saml.public_certificates}
            control={control}
            deletedCertificateIds={deletedCertificateIds}
            isEdit
            onToggleDeleteCertificate={handleToggleDeleteCertificate}
          />
        )}

        <AttributeMappingSection
          control={control}
          isEdit={isEdit}
          watch={watch}
        />

        <DrawerInlineActions>
          <Button
            data-pendo-id={
              isEdit
                ? IAM_EDIT_IDP_PENDO_IDS.cancel
                : IAM_CREATE_IDP_PENDO_IDS.cancel
            }
            onClick={handleClose}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            data-pendo-id={
              isEdit
                ? IAM_EDIT_IDP_PENDO_IDS.editIDPConfigurationEndFlow
                : IAM_CREATE_IDP_PENDO_IDS.createIDPConfigurationEndFlow
            }
            disabled={isSaveDisabled}
            processing={
              isSubmitting || isCreatingIdpConfig || isUpdatingIdpConfig
            }
            type="submit"
            variant="primary"
          >
            {isEdit ? 'Save Changes' : 'Create IDP Configuration'}
          </Button>
        </DrawerInlineActions>
      </form>
    </Drawer>
  );
};
