import React from "react";
import { Paper } from "src/components/Paper";
import CloudViewTabs from "./CloudViewTabs";
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import { testCors } from "./CloudViewRequest";

export const CloudViewLanding = (props: any) => {

    const logAndReturnData = (response: any) => {
        console.log("data", response.data, "error", error);
        return response.data;
    }

    const { data, loading, error } = useAPIRequest(
        () => testCors().
        then((response) => logAndReturnData(response)),
        [],
        [props.start, props.end, props.linodeId]
    );
    
    return (
        <>
            <Paper>
                <CloudViewTabs {...props}></CloudViewTabs>
            </Paper>  
        </>
    );
}

export default React.memo(CloudViewLanding);