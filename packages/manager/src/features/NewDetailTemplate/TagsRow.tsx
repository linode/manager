import React from 'react';
import { Box, Button, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Tag } from 'src/components/Tag/Tag';
import { SectionTitle } from './commonComponents';

interface TagsRowProps {
  tags: string[];
}

export const TagsRow: React.FC<TagsRowProps> = ({ tags }) => {
  return (
    <Grid
      size={{
        xs: 12,
      }}
    >
      <SectionTitle title="TAGS" />

      <Grid
        container
        spacing={2}
        sx={{
          display: 'flex',
          flexWrap: 'nowrap',
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <Grid>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            {tags.map((tag, index) => (
              <Tag
                colorVariant="lightBlue"
                key={`${tag}-${index}`}
                label={tag}
                onDelete={() => {}}
              />
            ))}
          </Box>
        </Grid>

        <Grid
          sx={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
            minWidth: 'fit-content',
          }}
        >
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => {}}
            variant="outlined"
            sx={{ height: 32 }}
          >
            Add Tag
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default TagsRow;
