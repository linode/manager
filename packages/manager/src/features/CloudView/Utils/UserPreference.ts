import { AclpConfig, AclpWidget } from "../Models/CloudPulsePreferences";
import { getUserPreferences, updateUserPreferences } from "@linode/api-v4";

let userPreference : AclpConfig;

export const getUserPreference = async () =>{
    if(userPreference) return {'aclpPreference' : {...userPreference}};
    const data = await  fetchUserPreference();
    userPreference  = {...data.aclpPreference};
    return data;
}


const fetchUserPreference = () =>{

    return getUserPreferences();
}

const updateUserPreference = async (updatedData : AclpConfig) => {
    return await updateUserPreferences({"aclpPreference" : updatedData});
}

export const updateGlobalFilterPreference =  (data :{})=>{
    if(!userPreference){
        userPreference = {} as AclpConfig
    }
    userPreference = { ...userPreference, ...data};
    userPreference = { ...userPreference, ...data};
    updateUserPreference(userPreference);
}

export const updateWidgetPreference =  (label : string, data: {}) => {
    if(!userPreference){
        userPreference = {} as AclpConfig
    }

    let widget = userPreference.widgets?.find((w) =>{
        return w.label === label;
    });
    if(!widget){
        widget = {
            label : label,
            ...data
        } as AclpWidget
        if(!userPreference.widgets){
            userPreference.widgets = []
        }
        userPreference.widgets.push(widget);
    }else{
        widget = {...widget, ...data};
        userPreference.widgets = userPreference.widgets?.map((w) => {
            if(w.label === label){
                return widget;
            }else{
                return w;
            }
        });
    }

    updateUserPreference(userPreference);
}