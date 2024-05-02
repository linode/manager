/* eslint-disable no-unused-expressions */
import { StatWithDummyPoint } from 'src/features/Longview/request.types';
import { convertData } from 'src/features/Longview/shared/formatters';

export const seriesDataFormatter = (
  data: any,
  startTime: any,
  endTime: any
) => {
  const formattedArray: StatWithDummyPoint[] = [];

  if (data && data.length > 0) {
    data?.forEach((element: any[]) => {
      const formattedPoint: StatWithDummyPoint = {
        x: Number(element[0]),
        y: element[1] ? Number(element[1]) : null,
      };
      formattedArray.push(formattedPoint);
    });
    return convertData(formattedArray, startTime, endTime);
  }

  return [];
};
