import { sendFormEvent } from './utils';

import type {
  BasicFormEvent,
  FormErrorEvent,
  FormInputEvent,
  FormStepEvent,
  LinodeCreateFlowVersion,
  LinodeCreateFormInputOptions,
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
export const sendLinodeCreateFormInputEvent = ({
  action,
  category,
  createType,
  formInputName,
  label,
  version,
}: LinodeCreateFormInputOptions) => {
  const formPayload: FormInputEvent = {
    formName: `Linode Create from ${createType} Form ${version} - Form Step${
      formInputName ? ` - ${formInputName}` : ''
    }`,
    inputValue: `${label} - ${action}:${category}`,
  };
  sendFormEvent(formPayload, 'formInput');
};

export const sendLinodeCreateFormStepEvent = ({
  createType,
  paperName,
  labelName,
  version,
}: LinodeCreateFormStepOptions) => {
  const formPayload: FormStepEvent = {
    formName: `Linode Create from ${createType} ${version}`,
    // Form Name - Paper Name - Label Name
    stepName: `Linode Create from ${createType} ${version} - ${paperName} - ${labelName}`,
  };
  sendFormEvent(formPayload, 'formStepInteraction');
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
