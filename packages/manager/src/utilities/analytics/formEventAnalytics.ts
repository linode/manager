import { getFormattedFormEventString, sendFormEvent } from './utils';

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
// VPCPanel.tsx
// SubnetContent.tsx
// LinodeCreate.tsx
// LinodeCreateContainer.tsx
// SelectRegionPanel.tsx
export const sendLinodeCreateFormInputEvent = ({
  createType,
  headerName,
  interaction,
  label,
  subheaderName,
  version,
}: LinodeCreateFormEventOptions) => {
  const formPayload: FormInputEvent = {
    formName: `Linode Create from ${createType} ${version}`,
    inputValue: getFormattedFormEventString({
      headerName,
      interaction,
      label,
      subheaderName,
    }),
  };
  sendFormEvent(formPayload, 'formInput');
};

// CreateFirewallDrawer.tsx
// VPCCreateDrawer.tsx
export const sendLinodeCreateFormStepEvent = ({
  createType,
  headerName,
  interaction,
  label,
  subheaderName,
  version,
}: LinodeCreateFormEventOptions) => {
  const formPayload: FormStepEvent = {
    formName: `Linode Create from ${createType} ${version}`,
    stepName: getFormattedFormEventString({
      headerName,
      interaction,
      label,
      subheaderName,
    }),
  };
  sendFormEvent(formPayload, 'formStepInteraction');
};

// LinodeCreate.tsx
export const sendLinodeCreateFormSubmitEvent = (
  createType: LinodeCreateType,
  version: LinodeCreateFlowVersion
) => {
  const formPayload: BasicFormEvent = {
    formName: `Linode Create from ${createType} ${version}`,
  };
  sendFormEvent(formPayload, 'formSubmit');
};

// LinodeCreate.tsx
// CreateFirewallDrawer.tsx
// useCreateVPC.ts
export const sendLinodeCreateFormErrorEvent = (
  formError: string,
  createType: LinodeCreateType,
  version: LinodeCreateFlowVersion
) => {
  const formPayload: FormErrorEvent = {
    formError,
    formName: `Linode Create from ${createType} ${version}`,
  };
  sendFormEvent(formPayload, 'formError');
};
