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
  className: string;
}

type CombinedProps = Props;

const DownloadCSV: React.FC<CombinedProps> = props => {
  return (
    <CSVLink
      className={props.className}
      headers={props.headers}
      filename={props.filename}
      data={cleanCSVData(props.data)}
    >
      {props.children}
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
  if (data === null) {
    return null;
  }

  if (Array.isArray(data)) {
    return data.map(eachValue => {
      return cleanCSVData(eachValue);
    });
  }

  if (typeof data === 'object') {
    return Object.keys(data).reduce((acc, eachKey) => {
      acc[eachKey] = cleanCSVData(data[eachKey]);
      return acc;
    }, {});
  }

  if (typeof data === 'boolean' || typeof data === 'number') {
    return data;
  }

  /**
   * fairly confident this should be typecast as a string by now
   * basically, just get rid of operator symbols
   */
  return (data as string).replace(/[-|+|=]/g, match => `"${match}"`);
};

export default compose<CombinedProps, Props>(React.memo)(DownloadCSV);
