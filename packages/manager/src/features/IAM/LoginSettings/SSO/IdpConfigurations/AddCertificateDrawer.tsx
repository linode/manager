import { toast } from '@akamai/cds-components/notification-toast';
import {
  Button,
  FormError,
  FormField,
  FormLabel,
  NotificationBanner,
  TextArea,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCreateIdpCertificateMutation } from '@linode/queries';
import { AddCertificateSchema } from '@linode/validation';
import * as React from 'react';
import type { Resolver } from 'react-hook-form';
import { Controller, useForm } from 'react-hook-form';

import { Drawer, DrawerInlineActions } from '../../../Shared/Drawer';
import { IAM_SSO_IDP_PENDO_IDS } from '../../constants';
import styles from './IdpConfigurationDrawer.module.css';

interface FormValues {
  certificate: string;
}

interface Props {
  existingCerts?: Array<{ certificate: string }>;
  idpConfigId: string;
  onClose: () => void;
  open: boolean;
}

const defaultValues: FormValues = {
  certificate: '',
};

export const AddCertificateDrawer = ({
  existingCerts = [],
  idpConfigId,
  onClose,
  open,
}: Props) => {
  const { mutateAsync: createIdpCertificate, isPending } =
    useCreateIdpCertificateMutation(idpConfigId);

  const {
    control,
    formState: { errors, isSubmitting, isValid },
    handleSubmit,
    reset,
    setError,
  } = useForm<FormValues>({
    context: { existingCerts },
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(AddCertificateSchema) as Resolver<FormValues>,
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async ({ certificate }: FormValues) => {
    try {
      await createIdpCertificate({
        certificate: certificate.trim(),
      });

      toast.open({
        text: 'Certificate added successfully.',
        type: 'success',
      });

      handleClose();
    } catch (errors) {
      const apiErrors = Array.isArray(errors) ? errors : [];

      for (const error of apiErrors) {
        setError('root', {
          message: error.reason,
        });
      }
    }
  };

  return (
    <Drawer aria-label="Add Certificate" onClose={handleClose} open={open}>
      <div slot="header">Add Certificate</div>
      <form noValidate onSubmit={handleSubmit(onSubmit)} slot="body">
        {errors.root?.message && (
          <NotificationBanner
            style={{ marginBottom: Spacing.S12 }}
            text={errors.root.message}
            type="error"
          />
        )}

        <p style={{ marginBottom: Spacing.S12, marginTop: 0 }}>
          Enter a SAML certificate for the IDP configuration.
        </p>

        <Controller
          control={control}
          name="certificate"
          render={({ field, fieldState }) => (
            <FormField
              className={styles.formFieldCertificate}
              error={!!fieldState.error}
              label-position="top"
            >
              <FormLabel label-position="top" slot="label">
                SAML Public Certificate
              </FormLabel>
              <TextArea
                aria-invalid={!!fieldState.error}
                data-pendo-id={IAM_SSO_IDP_PENDO_IDS.addCertSamlCert}
                error={!!fieldState.error}
                onChange={field.onChange}
                placeholder="Enter a SAML public certificate"
                rows={4}
                value={field.value}
              />
              <FormError>{fieldState?.error?.message}</FormError>
            </FormField>
          )}
        />

        <DrawerInlineActions>
          <Button
            data-pendo-id={IAM_SSO_IDP_PENDO_IDS.addCertCancel}
            onClick={handleClose}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            data-pendo-id={IAM_SSO_IDP_PENDO_IDS.addCertAddCertificate}
            disabled={!isValid}
            processing={isSubmitting || isPending}
            type="submit"
            variant="primary"
          >
            Add Certificate
          </Button>
        </DrawerInlineActions>
      </form>
    </Drawer>
  );
};
