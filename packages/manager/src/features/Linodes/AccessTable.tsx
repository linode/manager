import Grid, { Grid2Props } from '@mui/material/Unstable_Grid2';
import { SxProps } from '@mui/system';
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
  gridProps?: Grid2Props;
  isVPCOnlyLinode: boolean;
  rows: AccessTableRow[];
  sx?: SxProps;
  title: string;
}

export const AccessTable = React.memo((props: AccessTableProps) => {
  const { footer, gridProps, isVPCOnlyLinode, rows, sx, title } = props;
  return (
    <Grid
      container
      direction="column"
      md={6}
      spacing={1}
      sx={sx}
      {...gridProps}
    >
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
