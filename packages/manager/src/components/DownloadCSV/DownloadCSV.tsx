import { SxProps } from '@mui/system';
import * as React from 'react';
import { CSVLink } from 'react-csv';

import DownloadIcon from 'src/assets/icons/lke-download.svg';
import { Button } from 'src/components/Button/Button';
import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';

import type { ButtonType } from 'src/components/Button/Button';

interface DownloadCSVProps {
  buttonType?: 'styledLink' | ButtonType;
  children?: React.ReactNode;
  className?: string;
  csvRef?: React.RefObject<any>;
  data: unknown[];
  filename: string;
  headers: { key: string; label: string }[];
  onClick?: () => void;
  sx?: SxProps;
  text?: string;
}

/**
 * Hidden CSVLink component controlled by a ref. This is done
 * so we can use Button styles, and in other areas like
 * "MaintainanceTable" to lazy load potentially large sets
 * of events on mount.
 *
 * These aren't all the props provided by react-csv.
 * @see https://github.com/react-csv/react-csv
 */
export const DownloadCSV = ({
  buttonType = 'secondary',
  className,
  csvRef,
  data,
  filename,
  headers,
  onClick,
  sx,
  text = 'Download CSV',
}: DownloadCSVProps) => {
  const renderButton =
    buttonType === 'styledLink' ? (
      <StyledLinkButton onClick={onClick} sx={sx}>
        <DownloadIcon />
        {text}
      </StyledLinkButton>
    ) : (
      <Button
        buttonType={buttonType}
        component="span"
        disableRipple
        onClick={onClick}
        sx={sx}
        tabIndex={-1}
      >
        {text}
      </Button>
    );

  return (
    <>
      <CSVLink
        className={className}
        data={cleanCSVData(data)}
        filename={filename}
        headers={headers}
        ref={csvRef}
      />
      {renderButton}
    </>
  );
};

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
