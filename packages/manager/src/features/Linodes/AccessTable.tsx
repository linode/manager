import Grid, { Grid2Props } from '@mui/material/Unstable_Grid2';
import { SxProps } from '@mui/system';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { Link } from 'src/components/Link';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';

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

const sxTooltipIcon = {
  padding: '0',
  paddingLeft: '4px',
};

export const PUBLIC_IPS_UNASSIGNED_TOOLTIP_TEXT = `The Public IP Addresses have been unassigned from the
configuration profile.`;

export const AccessTable = React.memo((props: AccessTableProps) => {
  return (
    <Grid
      container
      direction="column"
      md={6}
      spacing={1}
      sx={props.sx}
      {...props.gridProps}
    >
      <StyledColumnLabelGrid>
        {props.title}{' '}
        {props.isVPCOnlyLinode && props.title.includes('Public IP Address') && (
          <TooltipIcon
            text={
              <Typography>
                {PUBLIC_IPS_UNASSIGNED_TOOLTIP_TEXT}{' '}
                <Link to="https://www.linode.com/docs/products/compute/compute-instances/guides/configuration-profiles/">
                  Learn more
                </Link>
                .
              </Typography>
            }
            interactive
            status="help"
            sxTooltipIcon={sxTooltipIcon}
          />
        )}
      </StyledColumnLabelGrid>
      <StyledTableGrid>
        <StyledTable>
          <TableBody>
            {props.rows.map((thisRow) => {
              return thisRow.text ? (
                <StyledTableRow key={thisRow.text}>
                  {thisRow.heading ? (
                    <TableCell component="th" scope="row">
                      {thisRow.heading}
                    </TableCell>
                  ) : null}
                  <StyledTableCell>
                    <StyledGradientDiv>
                      <CopyTooltip
                        copyableText
                        disabled={props.isVPCOnlyLinode}
                        text={thisRow.text}
                      />
                    </StyledGradientDiv>
                    <StyledCopyTooltip
                      disabled={props.isVPCOnlyLinode}
                      text={thisRow.text}
                    />
                  </StyledTableCell>
                </StyledTableRow>
              ) : null;
            })}
          </TableBody>
        </StyledTable>
        {props.footer ? <Grid sx={{ padding: 0 }}>{props.footer}</Grid> : null}
      </StyledTableGrid>
    </Grid>
  );
});
