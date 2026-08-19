import {
  Button,
  FormError,
  FormField,
  FormLabel,
  Icon,
  TextArea,
  Tooltip,
} from '@akamai/cds-components/react';
import * as React from 'react';
import { Controller, useFieldArray } from 'react-hook-form';
import type { Control } from 'react-hook-form';

import {
  ADD_BUTTON_MAX_TOOLTIP,
  IAM_CREATE_IDP_PENDO_IDS,
  IAM_EDIT_IDP_PENDO_IDS,
} from '../../constants';
import { CertificatesTable } from './CertificatesTable';
import styles from './IdpConfigurationDrawer.module.css';

import type { CreateIdpConfigPayload, IdpCertificate } from '@linode/api-v4';

interface CreateProps {
  control: Control<CreateIdpConfigPayload>;
  isEdit?: false;
}

interface EditProps {
  certificates: IdpCertificate[];
  control: Control<CreateIdpConfigPayload>;
  deletedCertificateIds: Set<string>;
  isEdit: true;
  onToggleDeleteCertificate: (id: string) => void;
}

type Props = CreateProps | EditProps;

export const CertificatesSection = (props: Props) => {
  const { control, isEdit } = props;

  const {
    fields: certificateFields,
    append: addCertificate,
    remove: removeCertificate,
  } = useFieldArray({
    control,
    name: 'saml.public_certificates',
  });

  const existingCertificatesCount = isEdit
    ? props.certificates.length - props.deletedCertificateIds.size
    : 0;
  const totalCertificatesCount =
    existingCertificatesCount + certificateFields.length;

  const isMaxCertificatesReached = totalCertificatesCount >= 10;
  const canRemoveCertificate =
    certificateFields.length > 1 || (isEdit && existingCertificatesCount > 0);

  return (
    <>
      {isEdit && props.certificates.length > 0 && (
        <CertificatesTable
          certificates={props.certificates}
          deletedIds={props.deletedCertificateIds}
          hasNewCertificates={certificateFields.length > 0}
          isAtMax={isMaxCertificatesReached}
          mode="edit"
          onToggleDelete={props.onToggleDeleteCertificate}
        />
      )}

      {certificateFields.map((certificateField, index) => (
        <Controller
          control={control}
          key={certificateField.id}
          name={`saml.public_certificates.${index}.certificate`}
          render={({ field, fieldState }) => (
            <div className={styles.certificateRow}>
              <div className={styles.certificateField}>
                <FormField
                  className={styles.formFieldCertificate}
                  error={!!fieldState.error}
                  label-position="top"
                  style={{
                    paddingTop:
                      isEdit && existingCertificatesCount !== 0 && index === 0
                        ? 'var(--token-global-spacing-s12, 12px)'
                        : 'var(--token-global-spacing-s0, 0)',
                  }}
                >
                  <FormLabel
                    className={
                      index === 0
                        ? styles.firstCertificateLabel
                        : styles.nextCertificateLabel
                    }
                    slot="label"
                  >
                    SAML Public Certificate
                  </FormLabel>
                  <TextArea
                    aria-invalid={!!fieldState.error}
                    data-pendo-id={
                      isEdit
                        ? IAM_EDIT_IDP_PENDO_IDS.samlCert
                        : IAM_CREATE_IDP_PENDO_IDS.samlCert
                    }
                    error={!!fieldState.error}
                    onChange={field.onChange}
                    placeholder="Enter a SAML public certificate"
                    rows={4}
                    value={field.value ?? ''}
                  />

                  {fieldState.error && (
                    <FormError>{fieldState.error.message}</FormError>
                  )}
                </FormField>
              </div>

              {canRemoveCertificate && (
                <Button
                  aria-label={`Remove SAML public certificate ${index + 1}`}
                  className={styles.removeCertificateButton}
                  data-pendo-id={
                    isEdit
                      ? IAM_EDIT_IDP_PENDO_IDS.samlCertDelete
                      : IAM_CREATE_IDP_PENDO_IDS.samlCertDelete
                  }
                  onClick={() => removeCertificate(index)}
                  type="button"
                  variant="icon"
                >
                  <Icon icon="delete" size="m" />
                </Button>
              )}
            </div>
          )}
        />
      ))}

      <Tooltip
        disabled={!isMaxCertificatesReached}
        tooltipPlacement="bottom"
        tooltipText={ADD_BUTTON_MAX_TOOLTIP}
      >
        <Button
          aria-disabled={isMaxCertificatesReached}
          className={styles.addCertificateButton}
          data-pendo-id={
            isEdit
              ? IAM_EDIT_IDP_PENDO_IDS.addAnotherCertificate
              : IAM_CREATE_IDP_PENDO_IDS.addAnotherCertificate
          }
          disabled={isMaxCertificatesReached}
          onClick={() => addCertificate({ certificate: '' })}
          type="button"
          variant="link"
        >
          Add Another Certificate
          {isMaxCertificatesReached && <Icon icon="info-outline" size="m" />}
        </Button>
      </Tooltip>
    </>
  );
};
