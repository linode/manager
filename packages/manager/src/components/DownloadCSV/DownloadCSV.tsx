import * as React from 'react';
import { CSVLink } from 'react-csv';

/**
 * These aren't all the props provided by react-csv.
 * @see https://github.com/react-csv/react-csv
 */
interface DownloadCSVProps {
  className?: string;
  data: any[];
  filename: string;
  headers: { label: string; key: string }[];
  children?: React.ReactNode;
}

export const cleanCSVData = (data: any): any => {
  /** safety check because typeof null === 'object' */
  if (data === null) {
    return '';
  }

  /** if it's an array, recursively clean each element in the array */
  if (Array.isArray(data)) {
    return data.map((eachValue) => {
      return cleanCSVData(eachValue);
    });
  }

  /** if it's an object, recursively sanitize each key value pair */
  if (typeof data === 'object') {
    return Object.keys(data).reduce((acc, eachKey) => {
      acc[eachKey] = cleanCSVData(data[eachKey]);
      return acc;
    }, {});
  }

  /** if it's a boolean or number, no need to sanitize */
  if (typeof data === 'boolean' || typeof data === 'number') {
    return data.toString();
  }

  /**
   * fairly confident this should be typecast as a string by now
   * basically, prefix the cell with : if the first character is a
   * blocklisted math operator
   */
  if (`${data}`.charAt(0).match(/[-|+|=|*]/g)) {
    return `:${data}`;
  }

  return data;
};

export const DownloadCSV = ({
  className,
  headers,
  filename,
  data,
  children,
}: DownloadCSVProps) => {
  return (
    <CSVLink
      className={className}
      headers={headers}
      filename={filename}
      data={cleanCSVData(data)}
    >
      {children}
    </CSVLink>
  );
};

export const MemoizedDownloadCSV = React.memo(DownloadCSV);
