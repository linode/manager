import {
  FormError,
  FormField,
  FormLabel,
  Select,
  TextField,
} from '@akamai/cds-components/react';
import * as React from 'react';
import { Controller } from 'react-hook-form';
import type { Control, UseFormWatch } from 'react-hook-form';

import {
  ATTRIBUTE_MAPPING_DESCRIPTION,
  ATTRIBUTE_NAME_HELPER_TEXT,
  IAM_CREATE_IDP_PENDO_IDS,
  IAM_EDIT_IDP_PENDO_IDS,
} from '../../constants';
import styles from './IdpConfigurationDrawer.module.css';
import {
  type IdentityElementOption,
  identityElementOptions,
} from './idpConfigurationDrawer.utils';

import type { CreateIdpConfigPayload } from '@linode/api-v4';

interface Props {
  control: Control<CreateIdpConfigPayload>;
  isEdit?: boolean;
  watch: UseFormWatch<CreateIdpConfigPayload>;
}

export const AttributeMappingSection = ({ control, isEdit, watch }: Props) => {
  return (
    <>
      <div className={styles.sectionHeading}>Attribute Mapping</div>
      <p className={styles.sectionDescription}>
        {ATTRIBUTE_MAPPING_DESCRIPTION}
      </p>

      <Controller
        control={control}
        name="saml.identity_element"
        render={({ field, fieldState }) => (
          <FormField
            className={styles.formFieldSelect}
            error={!!fieldState.error}
            label-position="top"
          >
            <FormLabel slot="label">Identity Element</FormLabel>
            <Select
              data-pendo-id={
                isEdit
                  ? IAM_EDIT_IDP_PENDO_IDS.identityElement
                  : IAM_CREATE_IDP_PENDO_IDS.identityElement
              }
              items={identityElementOptions}
              onChange={(event) => {
                const selected = (event as CustomEvent)
                  .detail as IdentityElementOption | null;
                if (selected) {
                  field.onChange(selected.value);
                }
              }}
              placeholder="Select an identity element"
              selected={
                identityElementOptions.find(
                  (opt) => opt.value === field.value
                ) ?? null
              }
              valueFn={(item) => (item as IdentityElementOption).label}
            />
            {fieldState.error && (
              <FormError>{fieldState.error.message}</FormError>
            )}
          </FormField>
        )}
      />

      {watch('saml.identity_element') === 'user_id_attribute' && (
        <Controller
          control={control}
          name="saml.user_id_attribute"
          render={({ field, fieldState }) => (
            <FormField
              className={styles.formFieldText}
              error={!!fieldState.error}
              label-position="top"
            >
              <FormLabel slot="label">Attribute Name</FormLabel>
              <TextField
                data-pendo-id={
                  isEdit
                    ? IAM_EDIT_IDP_PENDO_IDS.identityElementUserIDAttributeName
                    : IAM_CREATE_IDP_PENDO_IDS.identityElementUserIDAttributeName
                }
                onChange={field.onChange}
                placeholder="Enter an attribute name"
                value={field.value ?? ''}
              />
              {fieldState.error && (
                <FormError>{fieldState.error.message}</FormError>
              )}
              <p className={styles.helperText}>{ATTRIBUTE_NAME_HELPER_TEXT}</p>
            </FormField>
          )}
        />
      )}
    </>
  );
};
