export const getMetricsResponse = (requestBody: any) => {


    console.log(requestBody.step.unit)
    console.log(requestBody.step.value)

    if (requestBody.step.unit == "m" && requestBody.step.value == "1") {
        //one type of response
        //Instead of setting data statically, we can get and set from API call
        return {
            "data": {
                "result": [
                    {
                        "metric": {
                            "state": "dimension1"
                        },
                        "values": [...getArrayData(3, 1000, requestBody.startTime, requestBody.endTime)]
                    },
                    {
                        "metric": {
                            "state": "dimension2"
                        },
                        "values": getArrayData(2, 1000, requestBody.startTime, requestBody.endTime)
                    },
                    {
                        "metric": {
                            "state": "dimension3"
                        },
                        "values": getArrayData(6, 1000, requestBody.startTime, requestBody.endTime)
                    }
                ],
                "resultType": "matrix"
            },
            "isPartial": false,
            "stats": {
                "seriesFetched": "8"
            },
            "status": "success"
        };
    }

    if (requestBody.step.unit == "minute" && requestBody.step.value == "1") {
        //one type of response
        //Instead of setting data statically, we can get and set from API call
        return {
            "data": {
                "result": [
                    {
                        "metric": {
                            "state": "dimension1"
                        },
                        "values": [...getArrayData(3, 1000, requestBody.startTime, requestBody.endTime)]
                    },
                    {
                        "metric": {
                            "state": "dimension2"
                        },
                        "values": getArrayData(2, 1000, requestBody.startTime, requestBody.endTime)
                    },
                    {
                        "metric": {
                            "state": "dimension3"
                        },
                        "values": getArrayData(6, 1000, requestBody.startTime, requestBody.endTime)
                    }
                ],
                "resultType": "matrix"
            },
            "isPartial": false,
            "stats": {
                "seriesFetched": "8"
            },
            "status": "success"
        };
    }

    if (requestBody.step.unit == "minute" && requestBody.step.value == "5") {
        //one type of response
        return {
            "data": {
                "result": [
                    {
                        "metric": {
                            "state": "dimension1"
                        },
                        "values": getArrayData(1, 5000, requestBody.startTime, requestBody.endTime)
                    },
                    {
                        "metric": {
                            "state": "dimension2"
                        },
                        "values": getArrayData(9, 5000, requestBody.startTime, requestBody.endTime)
                    },
                    {
                        "metric": {
                            "state": "dimension3"
                        },
                        "values": getArrayData(4, 5000, requestBody.startTime, requestBody.endTime)
                    }
                ],
                "resultType": "matrix"
            },
            "isPartial": false,
            "stats": {
                "seriesFetched": "8"
            },
            "status": "success"
        };
    }

    if (requestBody.step.unit == "hour" && requestBody.step.value == "2") {        
        //one type of response
        return {
            "data": {
                "result": [
                    {
                        "metric": {
                            "state": "dimension1"
                        },
                        "values": getArrayData(9, 50000, requestBody.startTime, requestBody.endTime)
                    },
                    {
                        "metric": {
                            "state": "dimension2"
                        },
                        "values": getArrayData(7, 50000, requestBody.startTime, requestBody.endTime)
                    },
                    {
                        "metric": {
                            "state": "dimension3"
                        },
                        "values": getArrayData(5, 50000, requestBody.startTime, requestBody.endTime)
                    }
                ],
                "resultType": "matrix"
            },
            "isPartial": false,
            "stats": {
                "seriesFetched": "8"
            },
            "status": "success"
        };
    }

    if (requestBody.step.unit == "day" && requestBody.step.value == "1") {
        //one type of response
        return {
            "data": {
                "result": [
                    {
                        "metric": {
                            "state": "dimension1"
                        },
                        "values": getArrayData(3, 500000, requestBody.startTime, requestBody.endTime)
                    },
                    {
                        "metric": {
                            "state": "dimension2"
                        },
                        "values": getArrayData(7, 500000, requestBody.startTime, requestBody.endTime)
                    },
                    {
                        "metric": {
                            "state": "dimension3"
                        },
                        "values": getArrayData(5, 500000, requestBody.startTime, requestBody.endTime)
                    }
                ],
                "resultType": "matrix"
            },
            "isPartial": false,
            "stats": {
                "seriesFetched": "8"
            },
            "status": "success"
        };
    }


    return {};
}

const getArrayData = (incrementer: number, interval: number, start: number,
    end: number) => {

    let arrayData: Array<number[]> = [];
    let j = 1;    
    for (let i = start;
        i < end; i = i + interval) {
        let element: number[] = [];
        element[0] = i;
        element[1] = j + incrementer;
        j = j + incrementer;
        arrayData.push(element);
    }

    console.log(arrayData)

    return arrayData;

}