import { Linode } from '@linode/api-v4/lib/linodes';
import { useMediaQuery } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { styled, useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { Notice } from 'src/components/Notice/Notice';
import { OrderByProps } from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Paper } from 'src/components/Paper';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { Stack } from 'src/components/Stack';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';

import { PowerActionsDialog } from '../PowerActionsDialogOrDrawer';
import { SelectLinodeRow, SelectLinodeTableRowHead } from './SelectLinodeRow';

export interface ExtendedLinode extends Linode {
  heading: string;
  subHeadings: string[];
}

interface Notice {
  level: 'error' | 'warning'; // most likely only going to need these two 'warning'; 'warning';
  text: string;
}

interface Props {
  disabled?: boolean;
  error?: string;
  handleSelection: (id: number, type: null | string, diskSize?: number) => void;
  header?: string;
  notices?: Notice[];
  orderBy: OrderByProps<ExtendedLinode>;
  selectedLinodeID?: number;
}

export const SelectLinodePanel = (props: Props) => {
  const {
    disabled,
    error,
    handleSelection,
    header,
    notices,
    orderBy,
    selectedLinodeID,
  } = props;

  const linodes = orderBy.data;

  const flags = useFlags();
  const theme = useTheme();
  const matchesMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const [userSearchText, setUserSearchText] = React.useState<
    string | undefined
  >(undefined);

  const [powerOffLinode, setPowerOffLinode] = React.useState<
    { linodeID: number } | false
  >(false);

  // Capture the selected linode when this component mounts,
  // so it doesn't change when the user selects a different one.
  const [preselectedLinodeID] = React.useState(
    flags.linodeCloneUIChanges && selectedLinodeID
  );

  const searchText = React.useMemo(
    () =>
      userSearchText !== undefined
        ? userSearchText
        : linodes.find((linode) => linode.id === preselectedLinodeID)?.label ||
          '',
    [linodes, preselectedLinodeID, userSearchText]
  );

  const filteredLinodes = React.useMemo(
    () =>
      linodes.filter((linode) =>
        linode.label.toLowerCase().includes(searchText.toLowerCase())
      ),
    [linodes, searchText]
  );

  return (
    <>
      <Paginate data={filteredLinodes}>
        {({
          count,
          data: linodesData,
          handlePageChange,
          handlePageSizeChange,
          page,
          pageSize,
        }) => {
          return (
            <>
              <StyledPaper data-qa-select-linode-panel>
                <Stack gap={0.5} mb={2}>
                  {error && (
                    <Notice
                      spacingBottom={0}
                      spacingTop={0}
                      text={error}
                      variant="error"
                    />
                  )}
                  {notices &&
                    !disabled &&
                    notices.map((notice, i) => (
                      <Notice
                        key={i}
                        spacingBottom={0}
                        spacingTop={0}
                        text={notice.text}
                        variant={notice.level}
                      />
                    ))}
                </Stack>
                <Typography
                  marginBottom={
                    flags.linodeCloneUIChanges ? theme.spacing(2) : undefined
                  }
                  data-qa-select-linode-header
                  variant="h2"
                >
                  {!!header ? header : 'Select Linode'}
                </Typography>
                {flags.linodeCloneUIChanges && (
                  <DebouncedSearchTextField
                    customValue={{
                      onChange: setUserSearchText,
                      value: searchText,
                    }}
                    sx={{
                      marginBottom: theme.spacing(1),
                      width: '330px',
                    }}
                    clearable
                    debounceTime={0}
                    expand={true}
                    hideLabel
                    label=""
                    placeholder="Search"
                  />
                )}
                <StyledBox>
                  {(matchesMdUp ? renderTable : renderCards)({
                    disabled: disabled ?? false,
                    handlePowerOff: (linodeID) =>
                      setPowerOffLinode({ linodeID }),
                    handleSelection,
                    orderBy: { ...orderBy, data: linodesData },
                    selectedLinodeID,
                  })}
                </StyledBox>
              </StyledPaper>
              <PaginationFooter
                count={count}
                eventCategory={'Clone from existing panel'}
                handlePageChange={handlePageChange}
                handleSizeChange={handlePageSizeChange}
                page={page}
                pageSize={pageSize}
              />
            </>
          );
        }}
      </Paginate>
      {powerOffLinode && (
        <PowerActionsDialog
          action={'Power Off'}
          isOpen={!!powerOffLinode}
          linodeId={powerOffLinode.linodeID}
          manuallyUpdateConfigs={true}
          onClose={() => setPowerOffLinode(false)}
        />
      )}
    </>
  );
};

interface RenderLinodeProps {
  disabled: boolean;
  handlePowerOff: (linodeID: number) => void;
  handleSelection: Props['handleSelection'];
  orderBy: OrderByProps<ExtendedLinode>;
  selectedLinodeID: number | undefined;
}

const renderCards = ({
  disabled,
  handleSelection,
  orderBy: { data: linodes },
  selectedLinodeID,
}: RenderLinodeProps) => (
  <Grid container spacing={2}>
    {linodes.map((linode) => (
      <SelectionCard
        onClick={() => {
          handleSelection(linode.id, linode.type, linode.specs.disk);
        }}
        checked={linode.id === Number(selectedLinodeID)}
        disabled={disabled}
        heading={linode.heading}
        key={`selection-card-${linode.id}`}
        subheadings={linode.subHeadings}
      />
    ))}
  </Grid>
);

const renderTable = ({
  disabled,
  handlePowerOff,
  handleSelection,
  orderBy,
  selectedLinodeID,
}: RenderLinodeProps) => (
  <Table aria-label="Linode" size="small">
    <TableHead style={{ fontSize: '.875rem' }}>
      <SelectLinodeTableRowHead orderBy={orderBy} />
    </TableHead>
    <TableBody role="radiogroup">
      {orderBy.data.length > 0 ? (
        orderBy.data.map((linode) => (
          <SelectLinodeRow
            handleSelection={() =>
              handleSelection(linode.id, linode.type, linode.specs.disk)
            }
            disabled={disabled}
            handlePowerOff={() => handlePowerOff(linode.id)}
            key={linode.id}
            linodeId={linode.id}
            selected={Number(selectedLinodeID) === linode.id}
          />
        ))
      ) : (
        <TableRowEmpty colSpan={6} message={'No results'} />
      )}
    </TableBody>
  </Table>
);

const StyledBox = styled(Box, {
  label: 'StyledBox',
})(({ theme }) => ({
  padding: `${theme.spacing(2)} 0 0`,
}));

const StyledPaper = styled(Paper, { label: 'StyledPaper' })(({ theme }) => ({
  backgroundColor: theme.color.white,
  flexGrow: 1,
  width: '100%',
}));
