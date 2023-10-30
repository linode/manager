import React from "react";
import Select from "src/components/EnhancedSelect/Select";

export const UseCaseSelector = (props: any) => {
    return (
        <Select
            isMulti={false}
            label="Use Cases"
            onChange={()=>console.log("done")}
            options={[
            {
                label: 'Host Level Metrics',
                value: 'host'
            },
            {
                label: 'Guest Level Metrics',
                value: 'guest'
            },
            {
                label: 'DBaaS Metrics',
                value: 'dbaas'
            }
            ]}
            placeholder="Choose one use case for monitoring"
        />
    );
}

export default React.memo(UseCaseSelector);