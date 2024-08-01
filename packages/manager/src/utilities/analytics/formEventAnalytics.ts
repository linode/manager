import { getFormattedStringFromFormEventOptions, sendFormEvent } from './utils';

import type {
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
    inputValue: getFormattedStringFromFormEventOptions({
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
    stepName: getFormattedStringFromFormEventOptions({
      headerName,
      interaction,
      label,
      subheaderName,
    }),
  };
  sendFormEvent(formPayload, 'formStepInteraction');
};

// SelectRegionPanel.tsx
export const sendLinodeCreateFormStartEvent = ({
  createType,
  headerName,
  interaction,
  label,
  subheaderName,
}: LinodeCreateFormEventOptions) => {
  const formPayload: FormInputEvent = {
    formName: `Linode Create from ${createType}`,
    inputValue: getFormattedStringFromFormEventOptions({
      headerName,
      interaction,
      label,
      subheaderName,
    }),
  };
  sendFormEvent(formPayload, 'formStart');
};

// LinodeCreate.tsx
export const sendLinodeCreateFormSubmitEvent = ({
  createType,
  version,
  headerName,
  interaction,
  label,
  subheaderName,
}: LinodeCreateFormEventOptions) => {
  const formPayload: FormInputEvent = {
    formName: `Linode Create from ${createType} ${version}`,
    inputValue: getFormattedStringFromFormEventOptions({
      headerName,
      interaction,
      label,
      subheaderName,
    }),
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
