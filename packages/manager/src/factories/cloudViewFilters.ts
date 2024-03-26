import { Filters } from '@linode/api-v4/lib/cloudview/types';
import * as Factory from 'factory.ts';

export const cloudViewFilterFactory = Factory.Sync.makeFactory<Filters>({
    key:Factory.each((i) => getKey(i)),
    operator:'eq',
    value:Factory.each((i) => getValue(i))
});


const getKey = (index:number) => {

    
    if(index == 0 || index ==1 ) {
        return "service-type";
    }

    if(index % 2 == 0) {
        return "region";
    }

    if(index % 3 == 0) {
        return "time_range";
    }

    return "instance-id";

}

const getValue = (index:number) => {
    if(index == 0 || index ==1 ) {        
        return "aclb";
    }

    if(index % 2 == 0) {
        return "us-east";
    }

    if(index % 3 == 0) {
        return "time_range";
    }

    return "test-instance";
}