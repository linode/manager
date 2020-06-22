import * as classnames from 'classnames';
import * as React from 'react';
import Plus from 'src/assets/icons/plusSign.svg';

import { makeStyles, Theme } from 'src/components/core/styles';
import TableCell from 'src/components/TableCell';
import Tag from 'src/components/Tag/Tag_CMR';
import Grid from 'src/components/Grid'; // Have to use the MUI variant to get around ref issues

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    overflow: 'hidden',
    height: '40px'
  },
  addTag: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '30px',
    height: '30px',
    marginRight: theme.spacing(),
    backgroundColor: theme.bg.lightBlue,
    '& svg': {
      color: theme.palette.primary.main
    },
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
      '& svg': {
        color: 'white'
      }
    }
  },
  tagList: {
    position: 'relative',
    height: '50px',
    width: '100%'
  },
  tagListOverflow: {
    '&:before': {
      content: '""',
      width: '100%',
      height: '100%',
      position: 'absolute',
      left: 0,
      top: 0,
      background: `linear-gradient(to right, transparent 150px, white)`
    }
  }
}));

interface Props {
  tags: string[];
  width: string; // Required so we can fade out after a certain point
  addTag: (newTag: string) => void;
}

// https://stackoverflow.com/questions/143815/determine-if-an-html-elements-content-overflows
const checkOverflow = (el: any) => {
  const curOverflow = el.style.overflow;

  if (!curOverflow || curOverflow === 'visible') {
    el.style.overflow = 'hidden';
  }

  const isOverflowing =
    el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;

  el.style.overflow = curOverflow;

  return isOverflowing;
};

export type CombinedProps = Props;

export const TagCell: React.FC<Props> = props => {
  const { tags, width } = props;
  const [hasOverflow, setOverflow] = React.useState<boolean>(false);
  const classes = useStyles();
  const overflowRef = React.useCallback(node => {
    if (node !== null) {
      setOverflow(checkOverflow(node));
    }
  }, []);

  return (
    <TableCell className={classes.root}>
      <div ref={overflowRef} style={{ width }}>
        <Grid container direction="row" alignItems="center" wrap="nowrap">
          <Grid item className={classes.addTag}>
            <Plus />
          </Grid>
          <Grid container wrap="nowrap" direction="row">
            <Grid
              item
              className={classnames({
                [classes.tagList]: true,
                [classes.tagListOverflow]: hasOverflow
              })}
            >
              {tags.map(thisTag => (
                <Tag
                  key={`tag-item-${thisTag}`}
                  colorVariant="lightBlue"
                  label={thisTag}
                  onDelete={() => null}
                />
              ))}
            </Grid>
          </Grid>
        </Grid>
      </div>
    </TableCell>
  );
};

export default TagCell;
