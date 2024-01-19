import { Linode } from '@linode/api-v4/lib/linodes';
import Grid from '@mui/material/Unstable_Grid2';
import { styled, useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { Notice } from 'src/components/Notice/Notice';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Paper } from 'src/components/Paper';
import { RenderGuard } from 'src/components/RenderGuard';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';

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
  linodes: ExtendedLinode[];
  notices?: Notice[];
  selectedLinodeID?: number;
}

const SelectLinodePanel = (props: Props) => {
  const {
    disabled,
    error,
    handleSelection,
    header,
    linodes,
    notices,
    selectedLinodeID,
  } = props;

  const flags = useFlags();

  const theme = useTheme();
  const [userSearchText, setUserSearchText] = React.useState<
    string | undefined
  >(undefined);

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

  const renderCard = (linode: ExtendedLinode) => {
    return (
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
    );
  };

  return (
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
                  sx={{
                    marginBottom: theme.spacing(1),
                    width: '330px',
                  }}
                  clearable
                  debounceTime={0}
                  expand={true}
                  hideLabel
                  label=""
                  onSearch={setUserSearchText}
                  placeholder="Search"
                  value={searchText}
                />
              )}
              <StyledBox>
                <Grid container spacing={2}>
                  {linodesData.map((linode) => {
                    return renderCard(linode);
                  })}
                </Grid>
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
  );
};

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

export default RenderGuard(SelectLinodePanel);
