import { getUserPreferences, updateUserPreferences } from '@linode/api-v4';

import { AclpConfig } from '@linode/api-v4';

let userPreference: AclpConfig;
let timerId : ReturnType<typeof setTimeout>;

export const loadUserPreference = async () => {
  const data = await getUserPreferences();

  if(!data || !data.aclpPreference){
    userPreference = {} as AclpConfig
  }else{
    userPreference = { ...data.aclpPreference };
  }
  return data;
};

export const getUserPreferenceObject = () => {
  return { ...userPreference };
};

const updateUserPreference = async (updatedData: AclpConfig) => {
  const data = await getUserPreferences();
  return await updateUserPreferences({ ...data, aclpPreference: updatedData });
};

export const updateGlobalFilterPreference = (data: {}) => {
  if (!userPreference) {
    userPreference = {} as AclpConfig;
  }
  userPreference = { ...userPreference, ...data };

  debounce(userPreference);
};


const debounce = (updatedData : AclpConfig) =>{   //to avoid frequent preference update calls within 1 sec interval

  if(timerId){
    clearTimeout(timerId);
  }

  timerId = setTimeout(() => updateUserPreference(updatedData), 500);

}
