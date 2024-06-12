import { getUserPreferences, updateUserPreferences } from '@linode/api-v4';

import { AclpConfig, AclpWidget } from '../Models/CloudPulsePreferences';

let userPreference: AclpConfig;

export const getUserPreference = async () => {
  const data = await fetchUserPreference();
  if(!data || !data.aclpPreference){
    userPreference = {} as AclpConfig
  }else{
    userPreference = { ...data.aclpPreference };
  }
  return data;
};

const fetchUserPreference = () => {
  return getUserPreferences();
};

export const fetchUserPrefObject = () => {
  return { ...userPreference };
};

const updateUserPreference = async (updatedData: AclpConfig) => {
  return await updateUserPreferences({ aclpPreference: updatedData });
};

export const updateGlobalFilterPreference = (data: {}) => {
  if (!userPreference) {
    userPreference = {} as AclpConfig;
  }
  userPreference = { ...userPreference, ...data };

  updateUserPreference(userPreference);
};

export const updateWidgetPreference = (label: string, data: {}) => {
  if (!userPreference) {
    userPreference = {} as AclpConfig;
  }
  let widgets = userPreference.widgets;
  if(!widgets) {
    widgets = {}
    userPreference.widgets = widgets;
  }

  if(widgets[label]){
    widgets[label] = {...widgets[label], ...data};
  }else{
    widgets[label] = {label: label, ...data} as AclpWidget;
  }
  updateUserPreference(userPreference);
};
