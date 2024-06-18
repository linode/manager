import { sendFormEvent } from './utils';

import type {
  BasicFormEvent,
  FormErrorEvent,
  FormInputEvent,
  FormStepEvent,
  LinodeCreateFlowVersion,
  LinodeCreateFormEventOptions,
} from './types';
import type { LinodeCreateType } from 'src/features/Linodes/LinodesCreate/types';

/**
 * Form Events
 */

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
  createType,
  paperName,
  labelName,
  version,
}: LinodeCreateFormEventOptions) => {
  const formPayload: FormInputEvent = {
    formName: `Linode Create from ${createType} ${version}`,
    // Form Name - Paper Name - Label Name
    inputValue: `Linode Create from ${createType} ${version} - ${paperName} - ${labelName}`,
  };
  sendFormEvent(formPayload, 'formInput');
};

export const sendLinodeCreateFormStepEvent = ({
  createType,
  paperName,
  labelName,
  version,
}: LinodeCreateFormEventOptions) => {
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
