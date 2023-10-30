import React from "react";
import { SelectGrid } from "./SelectGrid";
import UseCaseSelector from "./UseCaseSelector";
import { StyledGrid } from "src/features/Linodes/LinodesCreate/TabbedContent/CommonTabbedContent.styles";
import { Paper } from "src/components/Paper";
import { Typography } from "src/components/Typography";
import CloudViewTabs from "./CloudViewTabs";


export const CloudViewLanding = (props: any) => {
    // const title:string="Choose a Use Case"

    return (
        <>
            <Paper>
            {/* <Typography data-qa-tp={title} variant="h2">
                {title}
            </Typography> */}
                <CloudViewTabs {...props}></CloudViewTabs>
            </Paper>  
        </>
    );
}

export default React.memo(CloudViewLanding)