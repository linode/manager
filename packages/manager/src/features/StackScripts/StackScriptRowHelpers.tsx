import { compose, isEmpty, lensIndex, map, over, splitAt, unless } from 'ramda';
import * as React from 'react';
import Chip from 'src/components/core/Chip';
import { StyleRulesCallback } from 'src/components/core/styles';
import ShowMore from 'src/components/ShowMore';

export type ClassNames =
  | 'root'
  | 'respPadding'
  | 'images'
  | 'libTitleContainer'
  | 'libRadio'
  | 'libRadioLabel'
  | 'libTitle'
  | 'libTitleLink'
  | 'libDescription'
  | 'colImages'
  | 'stackScriptCell'
  | 'stackScriptUsername'
  | 'deployButton'
  | 'detailsButton';

export const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    padding: theme.spacing.unit * 2,
    borderBottom: `solid 1px ${theme.palette.grey['200']}`
  },
  labelCell: {
    background: theme.bg.offWhite,
    marginBottom: theme.spacing.unit * 2
  },
  respPadding: {
    [theme.breakpoints.down('md')]: {
      paddingLeft: '78px !important'
    }
  },
  colImages: {
    padding: theme.spacing.unit
  },
  libTitleContainer: {
    display: 'flex'
  },
  libRadio: {
    display: 'flex',
    flexWrap: 'wrap',
    height: '100%',
    alignItems: 'center',
    width: 70
  },
  libRadioLabel: {
    cursor: 'pointer'
  },
  libTitle: {
    display: 'flex',
    flexWrap: 'wrap',
    maxWidth: '100%',
    justifyContent: 'space-between',
    paddingBottom: '0 !important',
    '& h3': {
      marginRight: 10
    }
  },
  libTitleLink: {
    display: 'block',
    marginTop: -1,
    fontSize: '.9rem'
  },
  libDescription: {
    paddingTop: '0 !important',
    [theme.breakpoints.up('md')]: {
      paddingRight: '100px !important'
    }
  },
  images: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    marginBottom: theme.spacing.unit
  },
  stackScriptCell: {
    maxWidth: '200px'
  },
  stackScriptUsername: {
    color: theme.color.grey1
  },
  deployButton: {
    // marginLeft: -26,
    // width: '100%',
    // justifyContent: 'flex-start',
    whiteSpace: 'nowrap',
    border: 0
  },
  detailsButton: {
    textAlign: 'left',
    padding: 0
  }
});

const createTag: (images: string) => JSX.Element = v => {
  const randomId = Math.floor(Math.random() * 1000);
  return (
    <Chip
      label={v}
      key={`${v}-${randomId}`}
      style={{ margin: '2px 2px', outline: 0 }}
      role="term"
    />
  );
};

const createTags: (images: string[]) => JSX.Element[] = map(createTag);

const createShowMore: (images: string[]) => JSX.Element = images => (
  <ShowMore key={0} items={images} render={createTags} />
);

export const displayTagsAndShowMore: (s: string[]) => JSX.Element[][] = compose<
  string[],
  string[][],
  any,
  JSX.Element[][]
>(
  over(lensIndex(1), unless(isEmpty, createShowMore)),
  over(lensIndex(0), createTags),
  splitAt(3)
);
