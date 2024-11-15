import { Button, StyledLinkButton } from '@linode/ui';
import * as React from 'react';
import { CSVLink } from 'react-csv';

import DownloadIcon from 'src/assets/icons/lke-download.svg';

import type { ButtonType } from '@linode/ui';
import type { SxProps, Theme } from '@mui/material/styles';

interface DownloadCSVProps {
  buttonType?: 'styledLink' | ButtonType;
  children?: React.ReactNode;
  className?: string;
  csvRef?: React.RefObject<any>;
  data: unknown[];
  filename: string;
  headers: { key: string; label: string }[];
  onClick: (() => void) | ((e: React.MouseEvent<HTMLButtonElement>) => void);
  sx?: SxProps<Theme>;
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
      <Button buttonType={buttonType} onClick={onClick} sx={sx}>
        {text}
      </Button>
    );

  return (
    <>
      <CSVLink
        // This is a visually hidden link that is controlled by the button below.
        // It should not be focusable or visible to screen readers either.
        aria-hidden={true}
        className={className}
        data={cleanCSVData(data)}
        filename={filename}
        headers={headers}
        ref={csvRef}
        tabIndex={-1}
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
    return Object.keys(data).reduce<{ [key: string]: any }>((acc, eachKey) => {
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
