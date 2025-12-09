import { getFormattedStringFromFormEventOptions, sendFormEvent } from './utils';

import type {
  BasicFormEvent,
  FormErrorEvent,
  FormInputEvent,
  FormStepEvent,
  LinodeCreateFormEventOptions,
} from './types';
import type { LinodeCreateType } from '@linode/utilities';

/**
 * Form Events
 */

// DetailsPanel.tsx
// SelectFirewallPanel.tsx
// CreateFirewallDrawer.tsx
// VPCTopSectionContent.tsx
// VPCPanel.tsx
// SubnetContent.tsx
// LinodeCreate.tsx
// LinodeCreateContainer.tsx
// SelectRegionPanel.tsx
// PlacementGroupsDetailPanel.tsx
export const sendLinodeCreateFormInputEvent = ({
  createType,
  headerName,
  interaction,
  label,
  subheaderName,
  trackOnce,
}: LinodeCreateFormEventOptions) => {
  const formPayload: FormInputEvent = {
    formName: `Linode Create from ${createType}`,
    inputValue: getFormattedStringFromFormEventOptions({
      headerName,
      interaction,
      label,
      subheaderName,
      trackOnce,
    }),
  };
  sendFormEvent(formPayload, 'formInput');
};

// CreateFirewallDrawer.tsx
// LinodeCreate.tsx
// PlacementGroupsCreateDrawer.tsx
// useCreateVPC.ts
export const sendLinodeCreateFormStepEvent = ({
  createType,
  headerName,
  interaction,
  label,
  subheaderName,
}: LinodeCreateFormEventOptions) => {
  const formPayload: FormStepEvent = {
    formName: `Linode Create from ${createType}`,
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
}: Partial<LinodeCreateFormEventOptions>) => {
  const formPayload: BasicFormEvent = {
    formName: `Linode Create from ${createType}`,
  };
  sendFormEvent(formPayload, 'formStart');
};

// LinodeCreate.tsx
export const sendLinodeCreateFormSubmitEvent = ({
  createType,
}: Partial<LinodeCreateFormEventOptions>) => {
  const formPayload: BasicFormEvent = {
    formName: `Linode Create from ${createType}`,
  };
  sendFormEvent(formPayload, 'formSubmit');
};

// LinodeCreate.tsx
// CreateFirewallDrawer.tsx
// useCreateVPC.ts
export const sendLinodeCreateFormErrorEvent = (
  formError: string,
  createType: LinodeCreateType
) => {
  const formPayload: FormErrorEvent = {
    formError,
    formName: `Linode Create from ${createType}`,
  };
  sendFormEvent(formPayload, 'formError');
};
