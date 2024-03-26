import React from "react";
import { LongviewLineGraph } from "src/components/LongviewLineGraph/LongviewLineGraph";
import { useProfile } from 'src/queries/profile';
import { seriesDataFormatter } from "./Formatters/CloudViewFormatter";
import { CloudViewGraphProperties } from "../Models/CloudViewGraphProperties";
import { Placeholder } from "src/components/Placeholder/Placeholder";



export const CloudViewGraph = (props: CloudViewGraphProperties) => {

    const { data: profile } = useProfile();

    const timezone = profile?.timezone || 'US/Eastern';

    const [cuber, setCuber] = React.useState<number>(0);

    const [staticData, setStaticData] = React.useState<Array<number[]>>([]);


    const setDataFunc = async () => {
        await(sleep(2000));

        let arrayData:Array<number[]> = [...staticData];
            
            if(cuber % 2 == 0) {
                arrayData.forEach(element => {
                    element[1] = element[1]*2;
                })
            } else {
                arrayData.forEach(element => {
                    element[1] = element[1]+2;
                })
            }
            

            setStaticData(arrayData);
        
    }

    function sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }


    React.useEffect(() => {

        console.log("changed inside cloud view")
        setCuber((cuber) => cuber+1);          

        if(props.dashboardFilters.timeRange) {
            console.log(props.dashboardFilters.timeRange.start)
        }        


        //Instead of setting data statically, we can get and set from API call
        if(staticData.length == 0) {
            let arrayData:Array<number[]> = [];
            for(let i=0; i<5; i++) {
                for(let j=i+1; j<=i*5; j++) {

                    let element:number[] = [];
                    element[0] = i;
                    element[1] = j*5;
                    arrayData.push(element);
                }
            }

            setStaticData(arrayData);
        } else {
            setDataFunc();
        }

        //tood, call metric collection API

    }, [props])

    return (
        <LongviewLineGraph
            data={[
                {
                    backgroundColor: 'lightgreen',
                    borderColor: 'skyblue',
                    data: seriesDataFormatter(staticData, props.dashboardFilters.timeRange?props.dashboardFilters.timeRange.start/1000:0, 
                        props.dashboardFilters.timeRange?props.dashboardFilters.timeRange.end/1000:0),
                    label: props.title
                }
            ]}
            ariaLabel={props.ariaLabel}
            error={false ? props.errorLabel : undefined}
            loading={staticData.length==0}
            nativeLegend
            showToday={props.isToday}
            subtitle={props.subtitle}
            timezone={timezone}
            title={props.title}
            unit={props.unit} />
        // <Placeholder title="Widgets Fetched successfully, need to render ">
        //     {cuber}

        // </Placeholder>
    )
}