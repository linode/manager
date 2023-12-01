import React from "react";
import { Paper } from "src/components/Paper";
import CloudViewTabs from "./CloudViewTabs";

export const CloudViewLanding = (props: any) => {
    
    return (
        <>
            <Paper>
                <CloudViewTabs {...props}></CloudViewTabs>
            </Paper>  
        </>
    );
}

export default React.memo(CloudViewLanding);