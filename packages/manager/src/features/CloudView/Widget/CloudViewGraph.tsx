import React from "react";
import { LongviewLineGraph } from "src/components/LongviewLineGraph/LongviewLineGraph";
import { useProfile } from 'src/queries/profile';
import { seriesDataFormatter } from "./Formatters/CloudViewFormatter";
import { CloudViewGraphProperties } from "../Models/CloudViewGraphProperties";
import { CircleProgress } from "src/components/CircleProgress";



export const CloudViewGraph = (props: CloudViewGraphProperties) => {

    const { data: profile } = useProfile();

    const timezone = profile?.timezone || 'US/Eastern';    

    const [data, setData] = React.useState<Array<number[]>>([]);

    const[loading, setLoading] = React.useState<boolean>(false);

    const getShowToday = () => {        
        return (props.end - props.start)/3600 <= 24;
    }


    React.useEffect(() => {

        let start = 0;
        let end = 0;

        setLoading(true);
        if (props.dashboardFilters) {
            
            if (props.dashboardFilters.timeRange && props.dashboardFilters.timeRange.start) {
                console.log(props.dashboardFilters.timeRange.start)
                start = props.dashboardFilters.timeRange.start;
            }

            if (props.dashboardFilters.timeRange && props.dashboardFilters.timeRange.end) {
                console.log(props.dashboardFilters.timeRange.end)
                end = props.dashboardFilters.timeRange.end;
            }

            //Instead of setting data statically, we can get and set from API call
            let arrayData: Array<number[]> = [];
            let j = 1;
            for (let i = start;
                i < end; i = i + 1000) {
                let element: number[] = [];
                element[0] = i;
                element[1] = j + 5;
                j = j + 5;
                arrayData.push(element);
            }            
            setData(arrayData)            
        }

        setLoading(false);

        //tood, call metric collection API

    }, [props.dashboardFilters]) //in case of changes in dashboardFilters, please update this

    if(data.length>0) {
        return (

        
            <LongviewLineGraph
                data={[
                    {
                        backgroundColor: 'lightgreen',
                        borderColor: 'skyblue',
                        data: seriesDataFormatter(data, props.dashboardFilters && props.dashboardFilters.timeRange ? props.dashboardFilters.timeRange.start : 0,
                            props.dashboardFilters && props.dashboardFilters.timeRange ? props.dashboardFilters.timeRange.end : 0),
                        label: props.title
                    }
                ]}
                ariaLabel={props.ariaLabel}
                error={false ? props.errorLabel : undefined}
                loading={loading}
                nativeLegend
                showToday={getShowToday()}
                subtitle={props.subtitle}
                timezone={timezone}
                title={props.title}
                unit={props.unit}
                suggestedMax={10} />            
        )
    } else {
        return (<CircleProgress/>);
    }
}