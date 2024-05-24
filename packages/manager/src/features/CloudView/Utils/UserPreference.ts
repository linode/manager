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

export const updateGlobalFilterPreference =  (data : {})=>{
    if(!userPreference){
        userPreference = {} as AclpConfig
    }
    userPreference = { ...userPreference, ...data};
    updateUserPreference(userPreference);
}

export const updateWidgetPreference =  (label : string, key : string, value : any) => {
    if(!userPreference){
        userPreference = {} as AclpConfig
    }

    userPreference.widgets = userPreference.widgets?.map((widget) => {
        const newWidget = {...widget} as AclpWidget
        if(widget.label === label){
            if(key === 'size'){
                newWidget.size = value;
            }else if(key === 'aggregateFunction'){
                newWidget.aggregateFunction = value
            }
        }
        return newWidget;
    });

    updateUserPreference(userPreference);
}