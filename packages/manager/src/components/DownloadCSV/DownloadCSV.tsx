import * as React from 'react';
import { CSVLink } from 'react-csv';
import { compose } from 'recompose';

/**
 * these aren't all the props provided by react-csv
 * check out the docs for all props: https://github.com/react-csv/react-csv
 */
interface Props {
  data: any[];
  headers: { label: string; key: string }[];
  filename: string;
  className?: string;
}

type CombinedProps = Props;

const DownloadCSV: React.FC<CombinedProps> = (props) => {
  const { className, headers, filename, data, children } = props;
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

/**
 * prevents CSV injections. Without this logic, a user
 * could, for example, add a tag of =cmd|' /C calc'!A0
 * then open the CSV up in Microsoft Excel and it would
 * automatically open the calculator.
 *
 * For now, we're just going to strip "=", "+", and "-"
 * signs, at the recommendation of hackerone discussions.
 * See M3-3022 for more info.
 */
export const cleanCSVData = (data: any): any => {
  /** safety check because typeof null === 'object' */
  if (data === null) {
    return null;
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
    return data;
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

export default compose<CombinedProps, Props>(React.memo)(DownloadCSV);
