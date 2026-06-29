import { array, boolean, object, string } from 'yup';

export const CreateIdpConfigSchema = object({
  default: boolean(),
  enabled: boolean(),
  enforce: boolean(),
  label: string()
    .required('This field is required.')
    .min(1, 'Label must be at least 1 character.')
    .max(128, 'Max of 128 characters.')
    .test(
      'no-whitespace-only',
      'Label cannot consist of only spaces.',
      (value) => !value || value.trim().length > 0,
    )
    .matches(
      /^[A-Za-z0-9 _.-]+$/,
      'A label can contain only letters, numbers, spaces, underscores, dashes and periods.',
    ),
  saml: object({
    entity_id: string()
      .required('This field is required.')
      .min(1, 'Entity ID must be at least 1 character.')
      .max(255, 'Max of 255 characters.'),
    identity_element: string().required('This field is required.'),
    idp_url: string()
      .required('This field is required.')
      .max(255, 'Max of 255 characters.')
      .test('is-valid-idp-url', function (value) {
        if (!value) {
          return true;
        }

        if (!value.startsWith('http://') && !value.startsWith('https://')) {
          return this.createError({
            message: 'IDP URL needs to start with http:// or https://.',
          });
        }

        try {
          new URL(value);
          return true;
        } catch {
          return this.createError({
            message: 'IDP URL needs to be a valid URL.',
          });
        }
      }),
    public_certificates: array()
      .of(
        object({
          certificate: string()
            .required('This field is required.')
            .max(
              4000,
              'SAML Public Certificate can contain up to 4000 characters.',
            )
            .test(
              'no-leading-trailing-whitespace',
              'Unable to parse the certificate. Make sure the input is correct.',
              (value) => !value || value === value.trim(),
            ),
        }),
      )
      .min(1, 'At least one SAML Public Certificate is required.')
      .max(10, 'At most 10 certificates are allowed.')
      .test('no-duplicates', '', function (value) {
        if (!value) return true;
        const seen = new Map<string, number>();
        for (let i = 0; i < value.length; i++) {
          const cert = value[i].certificate?.trim();
          if (!cert) continue;
          if (seen.has(cert)) {
            return this.createError({
              message: 'This certificate is already added.',
              path: `${this.path}[${i}].certificate`,
            });
          }
          seen.set(cert, i);
        }
        return true;
      }),
    user_id_attribute: string().when('identity_element', {
      is: 'user_id_attribute',
      then: (schema) =>
        schema
          .required('This field is required.')
          .min(1, 'Attribute Name must be at least 1 character.')
          .max(255, 'Max of 255 characters.'),
    }),
  }),
});

export const UpdateIdpConfigSchema = object({
  default: boolean(),
  enabled: boolean(),
  enforce: boolean(),
  label: string()
    .required('This field is required.')
    .min(1, 'Label must be at least 1 character.')
    .max(128, 'Max of 128 characters.')
    .test(
      'no-whitespace-only',
      'Label cannot consist of only spaces.',
      (value) => !value || value.trim().length > 0,
    )
    .matches(
      /^[A-Za-z0-9 _.-]+$/,
      'A label can contain only letters, numbers, spaces, underscores, dashes and periods.',
    ),
  saml: object({
    entity_id: string()
      .required('This field is required.')
      .min(1, 'Entity ID must be at least 1 character.')
      .max(255, 'Max of 255 characters.'),
    identity_element: string()
      .required('This field is required.')
      .oneOf(
        ['user_id_attribute', 'name_id'],
        'Identity Element must be user_id_attribute or name_id.',
      ),
    idp_url: string()
      .required('This field is required.')
      .max(255, 'Max of 255 characters.')
      .test('is-valid-idp-url', function (value) {
        if (!value) {
          return true;
        }

        if (!value.startsWith('http://') && !value.startsWith('https://')) {
          return this.createError({
            message: 'IDP URL needs to start with http:// or https://.',
          });
        }

        try {
          new URL(value);
          return true;
        } catch {
          return this.createError({
            message: 'IDP URL needs to be a valid URL.',
          });
        }
      }),
    public_certificates: array()
      .of(
        object({
          certificate: string()
            .required('This field is required.')
            .max(
              4000,
              'SAML Public Certificate can contain up to 4000 characters.',
            )
            .test(
              'no-leading-trailing-whitespace',
              'Unable to parse the certificate. Make sure the input is correct.',
              (value) => !value || value === value.trim(),
            ),
        }),
      )
      .test('no-duplicates', '', function (value) {
        if (!value) return true;
        const ctx = this.options.context as
          | undefined
          | { existingCerts?: Array<{ certificate: string }> };
        const seen = new Map<string, true>();
        for (const existing of ctx?.existingCerts ?? []) {
          const trimmed = existing.certificate?.trim();
          if (trimmed) seen.set(trimmed, true);
        }
        for (let i = 0; i < value.length; i++) {
          const cert = value[i].certificate?.trim();
          if (!cert) continue;
          if (seen.has(cert)) {
            return this.createError({
              message: 'This certificate is already added.',
              path: `${this.path}[${i}].certificate`,
            });
          }
          seen.set(cert, true);
        }
        return true;
      }),
    user_id_attribute: string().when('identity_element', {
      is: 'user_id_attribute',
      then: (schema) =>
        schema
          .required('Attribute Name is required.')
          .min(1, 'Attribute Name must be at least 1 character.')
          .max(255, 'Max of 255 characters.'),
    }),
  }),
});
export const AddCertificateSchema = object({
  certificate: string()
    .required('This field is required.')
    .max(4000, 'SAML Public Certificate can contain up to 4000 characters.')
    .test(
      'no-leading-trailing-whitespace',
      'Unable to parse the certificate. Make sure the input is correct.',
      (value) => !value || value === value.trim(),
    )
    .test(
      'no-duplicate',
      'This certificate is already added.',
      function (value) {
        if (!value) return true;
        const ctx = this.options.context as
          | undefined
          | { existingCerts?: Array<{ certificate: string }> };
        const trimmed = value.trim();
        return !(ctx?.existingCerts ?? []).some(
          (cert) => cert.certificate?.trim() === trimmed,
        );
      },
    ),
});
