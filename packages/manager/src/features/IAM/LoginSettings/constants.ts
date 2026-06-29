// Pendo IDs for IAM landing and tabs
export const IAM_LANDING_PENDO_IDS = {
  docsLink: 'IAM Landing-Docs',
  usersTab: 'IAM-Users',
  rolesTab: 'IAM-Roles',
  accountDelegationsTab: 'IAM-Account Delegations',
  settingsTab: 'IAM-Settings',
};

// Pendo IDs for IAM Settings
export const IAM_SETTINGS_PENDO_IDS = {
  learnMore: 'IAM Settings-Learn more',
  manageSSOEnforcement: 'IAM Settings-Manage SSO Enforcement',
};

// Pendo IDs for IAM SSO - IDP Configuration tab
export const IAM_SSO_IDP_PENDO_IDS = {
  idpTab: 'IAM Settings SSO-IDP',
  createIDPConfigurationStartFlow:
    'IAM Settings SSO IDP-Create IDP Configuration Start flow',
  deleteIDPConfigurationStartFlow:
    'IAM Settings SSO IDP-Delete IDP Configuration Start flow',
  editIDPConfiguration: 'IAM Settings SSO IDP-Edit IDP Configuration',
  copyEntityID: 'IAM Settings SSO IDP-Copy Entity ID',
  copyIDPURL: 'IAM Settings SSO IDP-Copy IDP URL',
  showSPMetadata: 'IAM Settings SSO IDP-Show SP Metadata',
  addCertificate: 'IAM Settings SSO IDP-Add Certificate',
  addCertificateWhenSSODisabled:
    'IAM Settings SSO IDP-Add Certificate when SSO disabled',
  copyCertificate: 'IAM Settings SSO IDP-Copy certificate',
  viewDetails: 'IAM Settings SSO IDP-View Details',
  deleteStartFlow: 'IAM Settings SSO IDP-Delete Start flow',
  deleteIDPConfigurationEndFlow:
    'IAM Settings SSO IDP-Delete IDP Configuration End flow',
  deleteCertificateCancel: 'IAM Settings SSO IDP-Delete Certificate Cancel',
  deleteCertificateEndFlow: 'IAM Settings SSO IDP-Delete Certificate End flow',
  deleteIDPConfigurationIdpLabel:
    'IAM Settings SSO IDP Delete IDP Configuration-IDP Label',
  deleteIDPConfigurationCancel:
    'IAM Settings SSO IDP Delete IDP Configuration-Cancel',
  viewDetailsCloseButton: 'IAM Settings SSO IDP View Details-Close',
  addCertSamlCert: 'IAM Add Cert-SAML Cert',
  addCertCancel: 'IAM Add Cert-Cancel',
  addCertAddCertificate: 'IAM Add Cert-Add Certificate',
};

// Pendo IDs for IAM SSO - SSO Enforcement tab
export const IAM_SSO_ENFORCE_PENDO_IDS = {
  enforceTab: 'IAM Settings SSO-Enforce',
  createIDPConfigurationStartFlow:
    'IAM Settings SSO Enforce-Create IDP Configuration Start flow',
  enableSSO: 'IAM Settings SSO Enforce-Enable SSO',
  enforceSSO: 'IAM Settings SSO Enforce-Enforce SSO for all users',
  includedUsersLearnMore: 'IAM Settings SSO Enforce Included Users-Learn more',
  includedUsers: 'IAM Settings SSO Enforce-Included Users',
  excludedUsersLearnMore: 'IAM Settings SSO Enforce Excluded Users-Learn more',
  excludedUsers: 'IAM Settings SSO Enforce-Excluded Users',
  updateSSOEnforcement: 'IAM Settings SSO Enforce-Update SSO Enforcement',
  consentChecked: 'IAM Settings SSO Enforce-Consent checked',
};

// Pendo IDs for IAM Create IDP drawer
export const IAM_CREATE_IDP_PENDO_IDS = {
  label: 'IAM Create IDP-Label',
  entityID: 'IAM Create IDP-Entity ID',
  idpURL: 'IAM Create IDP-IDP URL',
  samlCert: 'IAM Create IDP-SAML Cert',
  samlCertDelete: 'IAM Create IDP SAML Cert-Delete',
  addAnotherCertificate: 'IAM Create IDP-Add Another Certificate',
  identityElement: 'IAM Create IDP-Identity Element',
  identityElementUserIDAttributeName:
    'IAM Create IDP Identity Element User ID Attribute-Name',
  cancel: 'IAM Create IDP-Cancel',
  createIDPConfigurationEndFlow:
    'IAM Create IDP-Create IDP Configuration End flow',
};

// Pendo IDs for IAM Edit IDP drawer
export const IAM_EDIT_IDP_PENDO_IDS = {
  samlCertDelete: 'IAM Edit IDP SAML Cert-Delete',
  samlCertUndo: 'IAM Edit IDP SAML Cert-Undo',
  label: 'IAM Edit IDP-Label',
  entityID: 'IAM Edit IDP-Entity ID',
  idpURL: 'IAM Edit IDP-IDP URL',
  samlCert: 'IAM Edit IDP-SAML Cert',
  addAnotherCertificate: 'IAM Edit IDP-Add Another Certificate',
  identityElement: 'IAM Edit IDP-Identity Element',
  identityElementUserIDAttributeName:
    'IAM Edit IDP Identity Element User ID Attribute-Name',
  cancel: 'IAM Edit IDP-Cancel',
  editIDPConfigurationEndFlow: 'IAM Edit IDP-Edit IDP Configuration End flow',
};

export const ADD_BUTTON_MAX_TOOLTIP = 'You can add up to 10 certificates.';

export const MAX_CERTIFICATES_REACHED_ERROR =
  'The configuration can have up to 10 certificates. Delete an unused certificate to add a new one.';

export const ALL_CERTIFICATES_DELETED_ERROR =
  'IDP configuration requires at least one active certificate. ';

export const ATTRIBUTE_MAPPING_DESCRIPTION =
  'Select which element in the SAML assertion you want to use to identify the user.';

export const ATTRIBUTE_NAME_HELPER_TEXT =
  'The name needs to match the attribute key configured in your IDP.';

export const CREATE_SUCCESS = 'IDP configuration created successfully.';

export const IDENTITY_PROVIDER_DESCRIPTION =
  'Use the IDP metadata from your identity provider (IDP) to create the configuration.';

export const UPDATE_SUCCESS = 'IDP configuration updated successfully.';

export const SSO_REQUIRES_ACTIVE_CERTIFICATE =
  'SSO requires at least one active certificate. Add a new certificate to enable the deletion.';

export const SSO_EXPIRED_ENFORCED =
  'All certificates have expired. Add a new certificate to allow SSO-enforced users to log in.';

export const SSO_EXPIRING =
  'The certificate is about to expire. Add a new one to ensure continued operation of this SSO federation.';

export const SSO_CANNOT_DELETE_LAST_CERTIFICATE =
  "You can't delete the last certificate while SSO is enabled. Add a new certificate or disable the SSO.";

export const DELETE_PERMISSION_ERROR =
  'You do not have permission to delete certificates.';

export const VIEW_DETAILS_PERMISSION_ERROR =
  'You do not have permission to view certificate details.';

export const ADD_CERTIFICATE_PERMISSION_ERROR =
  'You do not have permission to add certificates.';

export const METADATA_HREF = 'https://login.linode.com/saml/sp/metadata';

export const DUPLICATED_SSO_USER = `User's can't be SSO-required and an SSO exception at the same time. Remove any duplicated users from either list.`;
