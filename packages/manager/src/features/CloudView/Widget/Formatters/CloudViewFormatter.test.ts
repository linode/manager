import { seriesDataFormatter } from "./CloudViewFormatter"

describe('testSeriesDataFormatterHappyPath', () => {
    it('should return a time series without any issues with proper inputs', () => {
        let data:Array<number[]> = [];
        
        let j=2;
        for(let i=0; i<10; i++) {
            let element = [];
            element[0] = i;
            element[1] = j*5;
            j++;

            data.push(element);
        }        

        expect(seriesDataFormatter(data, 1,2)).toHaveLength(10);

    }),
    it('should return a empty time series with undefined dataset', () => {
        expect(seriesDataFormatter(undefined, 1,2)).toHaveLength(0);

    }),
    it('should return a empty time series without any issues for empty dataset', () => {

        console.log(seriesDataFormatter([], 1,2));

        expect(seriesDataFormatter([], 1,2)).toHaveLength(0);

    })
})