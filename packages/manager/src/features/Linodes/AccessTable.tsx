import Grid from '@mui/material/Grid';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { PublicIPAddressesTooltip } from 'src/features/Linodes/PublicIPAddressesTooltip';

import {
  StyledColumnLabelGrid,
  StyledCopyTooltip,
  StyledGradientDiv,
  StyledTable,
  StyledTableCell,
  StyledTableGrid,
  StyledTableRow,
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
  isVPCOnlyLinode: boolean;
  rows: AccessTableRow[];
  sx?: SxProps<Theme>;
  title: string;
}

export const AccessTable = React.memo((props: AccessTableProps) => {
  const { footer, gridSize, isVPCOnlyLinode, rows, sx, title } = props;

  const isDisabled = isVPCOnlyLinode && title.includes('Public IP Address');

  return (
    <Grid
      sx={sx}
      size={{
        lg: gridSize.lg,
        xs: gridSize.xs,
      }}
    >
      <StyledColumnLabelGrid>
        {title} {isDisabled && PublicIPAddressesTooltip}
      </StyledColumnLabelGrid>
      <StyledTableGrid>
        <StyledTable>
          <TableBody>
            {rows.map((thisRow) => {
              return thisRow.text ? (
                <StyledTableRow disabled={isDisabled} key={thisRow.text}>
                  {thisRow.heading ? (
                    <TableCell component="th" scope="row">
                      {thisRow.heading}
                    </TableCell>
                  ) : null}
                  <StyledTableCell>
                    <StyledGradientDiv>
                      <CopyTooltip
                        copyableText
                        disabled={isDisabled}
                        masked={thisRow.isMasked}
                        maskedTextLength={thisRow.maskedTextLength}
                        text={thisRow.text}
                      />
                    </StyledGradientDiv>
                    <StyledCopyTooltip
                      disabled={isDisabled}
                      text={thisRow.text}
                    />
                  </StyledTableCell>
                </StyledTableRow>
              ) : null;
            })}
          </TableBody>
        </StyledTable>
        {footer ? <Grid sx={{ padding: 0 }}>{footer}</Grid> : null}
      </StyledTableGrid>
    </Grid>
  );
});
