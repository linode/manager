import Grid from '@mui/material/Grid';
import * as React from 'react';
import type { JSX } from 'react';

import { TableBody } from 'src/components/TableBody';
import { PublicIPAddressesTooltip } from 'src/features/Linodes/PublicIPAddressesTooltip';

import { AccessRow } from './AccessRow';
import {
  StyledColumnLabelGrid,
  StyledTable,
  StyledTableGrid,
} from './LinodeEntityDetail.styles';

import type { SxProps, Theme } from '@mui/material/styles';
import type { MaskableTextLength } from 'src/components/MaskableText/MaskableText';

interface AccessTableRow {
  disabled?: boolean;
  heading?: string;
  isMasked?: boolean;
  maskedTextLength?: MaskableTextLength;
  text: null | string;
}

interface AccessTableProps {
  footer?: JSX.Element;
  gridSize: {
    lg: number;
    xs: number;
  };
  isLinodeInterface?: boolean;
  isUnreachablePublicIPv4?: boolean;
  isUnreachablePublicIPv6?: boolean;
  rows: AccessTableRow[];
  sx?: SxProps<Theme>;
  title: string;
}

export const AccessTable = React.memo((props: AccessTableProps) => {
  const {
    footer,
    gridSize,
    isUnreachablePublicIPv6,
    isUnreachablePublicIPv4,
    isLinodeInterface = false,
    rows,
    sx,
    title,
  } = props;

  const showDisabledPublicIPTooltip =
    isUnreachablePublicIPv4 || isUnreachablePublicIPv6;

  return (
    <Grid
      size={{
        lg: gridSize.lg,
        xs: gridSize.xs,
      }}
      sx={sx}
    >
      <StyledColumnLabelGrid>
        {title}{' '}
        {showDisabledPublicIPTooltip && (
          <PublicIPAddressesTooltip
            hasPublicInterface={!isUnreachablePublicIPv6}
            isLinodeInterface={isLinodeInterface}
          />
        )}
      </StyledColumnLabelGrid>
      <StyledTableGrid>
        <StyledTable>
          <TableBody>
            {rows.map((thisRow) => {
              return thisRow.text ? (
                <AccessRow
                  heading={thisRow.heading}
                  isDisabled={Boolean(thisRow.disabled)}
                  key={thisRow.text}
                  text={thisRow.text}
                />
              ) : null;
            })}
          </TableBody>
        </StyledTable>
        {footer ? <Grid sx={{ padding: 0 }}>{footer}</Grid> : null}
      </StyledTableGrid>
    </Grid>
  );
});
