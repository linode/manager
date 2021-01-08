import { compose, isEmpty, lensIndex, map, over, splitAt, unless } from 'ramda';
import * as React from 'react';
import Chip from 'src/components/core/Chip';
import { createStyles, Theme } from 'src/components/core/styles';
import ShowMore from 'src/components/ShowMore';

export type ClassNames =
  | 'libRadio'
  | 'libRadioLabel'
  | 'libTitle'
  | 'libDescription'
  | 'selectionGrid'
  | 'stackScriptCell'
  | 'stackScriptUsername'
  | 'detailsButton'
  | 'chip';

export const styles = (theme: Theme) =>
  createStyles({
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
      [theme.breakpoints.down('sm')]: {
        wordBreak: 'break-all'
      }
    },
    libDescription: {
      [theme.breakpoints.down('sm')]: {
        fontSize: 12
      },
      [theme.breakpoints.between('sm', 'lg')]: {
        wordBreak: 'break-word'
      }
    },
    selectionGrid: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      [theme.breakpoints.up('sm')]: {
        flexWrap: 'nowrap',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      }
    },
    stackScriptCell: {
      width: '100%'
    },
    stackScriptUsername: {
      color: theme.color.grey1
    },
    detailsButton: {
      padding: 0,
      fontSize: '0.875rem',
      marginTop: -theme.spacing(1),
      [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(1),
        marginTop: 0,
        width: 100
      },
      '&:hover, &:focus': {
        backgroundColor: 'transparent'
      }
    },
    chip: {
      '& .MuiChip-root:first-child': {
        backgroundColor: theme.cmrBGColors.bgApp
      }
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
  <ShowMore key={0} items={images} render={createTags} ariaItemType="images" />
);

export const displayTagsAndShowMore: (s: string[]) => JSX.Element[][] = compose<
  string[],
  string[][],
  any,
  JSX.Element[][]
>(
  over(lensIndex(1), unless(isEmpty, createShowMore)),
  over(lensIndex(0), createTags),
  splitAt(1)
);
