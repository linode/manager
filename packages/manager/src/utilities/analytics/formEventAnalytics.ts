import { sendFormEvent } from './utils';

import type {
  BasicFormEvent,
  FormErrorEvent,
  FormInputEvent,
  FormStepEvent,
  LinodeCreateFlowVersion,
  LinodeCreateFormStepOptions,
} from './types';
import type { LinodeCreateType } from 'src/features/Linodes/LinodesCreate/types';

/**
 * Form Events
 */

// AddNewMenu.tsx
// LinodesLanding.tsx
// LinodesLandingEmptyState.tsx
// PrimaryNav.tsx
export const sendLinodeCreateFormStartEvent = (
  formStartName: string,
  createType: LinodeCreateType,
  version: LinodeCreateFlowVersion
) => {
  const formPayload: BasicFormEvent = {
    formName: `Linode Create from ${createType} Form ${version} - Form Start - ${formStartName}`,
  };
  sendFormEvent(formPayload, 'formFocus');
};

// SelectFirewallPanel.tsx
// CreateFirewallDrawer.tsx
// VPCTopSectionContent.tsx
// VPCCreateDrawer.tsx
// VPCPanel.tsx
// SubnetContent.tsx
// LinodeCreate.tsx
// LinodeCreateContainer.tsx
// SelectRegionPanel.tsx
export const sendLinodeCreateFormStepEvent = ({
  action,
  category,
  createType,
  formStepName,
  label,
  version,
}: LinodeCreateFormStepOptions) => {
  const formPayload: FormStepEvent = {
    formName: `Linode Create from ${createType} Form ${version} - Form Step${
      formStepName ? ` - ${formStepName}` : ''
    }`,
    stepName: `${label} - ${action}:${category}`,
  };
  sendFormEvent(formPayload, 'formStepInteraction');
};

export const sendLinodeCreateFormInputEvent = (
  formInputName: string,
  formInputValue: string,
  createType: LinodeCreateType,
  version: LinodeCreateFlowVersion
) => {
  const formPayload: FormInputEvent = {
    formName: `Linode Create from ${createType} Form ${version} - Form Input${
      formInputName ? ` - ${formInputName}` : ''
    }`,
    inputValue: formInputValue,
  };
  sendFormEvent(formPayload, 'formInput');
};

// LinodeCreate.tsx
export const sendLinodeCreateFormSubmitEvent = (
  formEndName: string,
  createType: LinodeCreateType,
  version: LinodeCreateFlowVersion
) => {
  const formPayload: BasicFormEvent = {
    formName: `Linode Create from ${createType} Form ${version} - Form End - ${formEndName}`,
  };
  sendFormEvent(formPayload, 'formSubmit');
};

// LinodeCreate.tsx
export const sendLinodeCreateFormErrorEvent = (
  formError: string,
  createType: LinodeCreateType,
  version: LinodeCreateFlowVersion
) => {
  const formPayload: FormErrorEvent = {
    formError,
    formName: `Linode Create from ${createType} Form ${version} - Form Error`,
  };
  sendFormEvent(formPayload, 'formError');
};
