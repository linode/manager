import * as React from 'react';
import Plus from 'src/assets/icons/plusSign.svg';

import { makeStyles, Theme } from 'src/components/core/styles';
import TableCell from 'src/components/TableCell';
import Tag from 'src/components/Tag';
import Grid from 'src/components/Grid';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  addTag: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '30px',
    height: '30px',
    backgroundColor: theme.bg.lightBlue,
    '& svg': {
      color: theme.palette.primary.main
    }
  }
}));

interface Props {
  tags: string[];
  addTag: (newTag: string) => void;
}

export type CombinedProps = Props;

export const TagCell: React.FC<Props> = props => {
  const { tags } = props;
  const classes = useStyles();
  return (
    <TableCell className={classes.root}>
      <Grid container direction="row" alignItems="center">
        <Grid item className={classes.addTag}>
          <Plus />
        </Grid>
        <Grid item>
          {tags.map(thisTag => (
            <Tag
              key={`tag-item-${thisTag}`}
              colorVariant="lightBlue"
              label="thisTag"
              onDelete={() => null}
            />
          ))}
        </Grid>
      </Grid>
    </TableCell>
  );
};

export default TagCell;
