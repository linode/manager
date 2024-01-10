import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { PublicIpsUnassignedTooltip } from 'src/features/Linodes/PublicIpsUnassignedTooltip';

import {
  StyledColumnLabelGrid,
  StyledCopyTooltip,
  StyledGradientDiv,
  StyledTable,
  StyledTableCell,
  StyledTableGrid,
  StyledTableRow,
} from './LinodeEntityDetail.styles';

interface AccessTableRow {
  heading?: string;
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
  title: string;
}

export const AccessTable = React.memo((props: AccessTableProps) => {
  const { footer, gridSize, isVPCOnlyLinode, rows, title } = props;
  return (
    <Grid lg={gridSize.lg} sx={{ padding: 0 }} xs={gridSize.xs}>
      <StyledColumnLabelGrid>
        {title}{' '}
        {isVPCOnlyLinode &&
          title.includes('Public IP Address') &&
          PublicIpsUnassignedTooltip}
      </StyledColumnLabelGrid>
      <StyledTableGrid>
        <StyledTable>
          <TableBody>
            {rows.map((thisRow) => {
              return thisRow.text ? (
                <StyledTableRow disabled={isVPCOnlyLinode} key={thisRow.text}>
                  {thisRow.heading ? (
                    <TableCell component="th" scope="row">
                      {thisRow.heading}
                    </TableCell>
                  ) : null}
                  <StyledTableCell>
                    <StyledGradientDiv>
                      <CopyTooltip
                        copyableText
                        disabled={isVPCOnlyLinode}
                        text={thisRow.text}
                      />
                    </StyledGradientDiv>
                    <StyledCopyTooltip
                      disabled={isVPCOnlyLinode}
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
