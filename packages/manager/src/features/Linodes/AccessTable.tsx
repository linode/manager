import Grid from '@mui/material/Grid2';
import * as React from 'react';

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
  isVPCOnlyLinode: boolean;
  rows: AccessTableRow[];
  sx?: SxProps<Theme>;
  title: string;
}

export const AccessTable = React.memo((props: AccessTableProps) => {
  const {
    footer,
    gridSize,
    isVPCOnlyLinode,
    isLinodeInterface = false,
    rows,
    sx,
    title,
  } = props;

  const isDisabled = isVPCOnlyLinode && title.includes('Public IP Address');

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
        {isDisabled && (
          <PublicIPAddressesTooltip isLinodeInterface={isLinodeInterface} />
        )}
      </StyledColumnLabelGrid>
      <StyledTableGrid>
        <StyledTable>
          <TableBody>
            {rows.map((thisRow) => {
              return thisRow.text ? (
                <AccessRow
                  heading={thisRow.heading}
                  isDisabled={isDisabled}
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
