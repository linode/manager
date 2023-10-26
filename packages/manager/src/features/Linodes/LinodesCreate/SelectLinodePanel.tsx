import { Linode } from '@linode/api-v4/lib/linodes';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Notice } from 'src/components/Notice/Notice';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Paper } from 'src/components/Paper';
import { RenderGuard } from 'src/components/RenderGuard';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { Typography } from 'src/components/Typography';
import { omittedProps } from 'src/utilities/omittedProps';

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
  notice?: Notice;
  selectedLinodeID?: number;
}

const SelectLinodePanel = (props: Props) => {
  const {
    disabled,
    error,
    handleSelection,
    header,
    linodes,
    notice,
    selectedLinodeID,
  } = props;

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
    <Paginate data={linodes}>
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
              {error && <Notice text={error} variant="error" />}
              {notice && !disabled && (
                <Notice text={notice.text} variant={notice.level} />
              )}
              <Typography data-qa-select-linode-header variant="h2">
                {!!header ? header : 'Select Linode'}
              </Typography>
              <StyledTypography component="div">
                <Grid container spacing={2}>
                  {linodesData.map((linode) => {
                    return renderCard(linode);
                  })}
                </Grid>
              </StyledTypography>
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

export type StyledTypographyProps = { component: string };

const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
  shouldForwardProp: omittedProps(['component']),
})<StyledTypographyProps>(({ theme }) => ({
  padding: `${theme.spacing(2)} 0 0`,
}));

const StyledPaper = styled(Paper, { label: 'StyledPaper' })(({ theme }) => ({
  backgroundColor: theme.color.white,
  flexGrow: 1,
  width: '100%',
}));

export default RenderGuard(SelectLinodePanel);
