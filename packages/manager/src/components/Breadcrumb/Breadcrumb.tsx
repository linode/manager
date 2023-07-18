import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { CrumbOverridesProps, Crumbs } from './Crumbs';
import { EditableProps, LabelProps } from './types';

export interface BreadcrumbProps {
  breadcrumbDataAttrs?: { [key: string]: boolean };
  className?: string;
  crumbOverrides?: CrumbOverridesProps[];
  firstAndLastOnly?: boolean;
  labelOptions?: LabelProps;
  labelTitle?: string;
  onEditHandlers?: EditableProps;
  pathname: string;
  removeCrumbX?: number;
}

const useStyles = makeStyles()((theme: Theme) => ({
  editablePreContainer: {
    alignItems: 'center',
  },
  hasError: {
    marginBottom: theme.spacing(5),
  },
  preContainer: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    minHeight: 48,
  },
  root: {
    alignItems: 'center',
    display: 'flex',
    [theme.breakpoints.only('sm')]: {
      marginLeft: theme.spacing(),
    },
    [theme.breakpoints.only('xs')]: {
      marginLeft: theme.spacing(),
    },
  },
}));

const Breadcrumb = (props: BreadcrumbProps) => {
  const { classes, cx } = useStyles();

  const {
    breadcrumbDataAttrs,
    className,
    crumbOverrides,
    firstAndLastOnly,
    labelOptions,
    labelTitle,
    onEditHandlers,
    pathname,
    removeCrumbX,
  } = props;

  const url = pathname && pathname.slice(1);
  const allPaths = url.split('/');

  const pathMap = removeCrumbX
    ? removeByIndex(allPaths, removeCrumbX - 1)
    : allPaths;

  const hasError = Boolean(onEditHandlers?.errorText);

  return (
    <div
      className={cx(
        {
          [classes.hasError]: hasError,
          [classes.root]: true,
        },
        className
      )}
      {...breadcrumbDataAttrs}
    >
      <div
        className={cx({
          [classes.editablePreContainer]: onEditHandlers !== undefined,
          [classes.preContainer]: true,
        })}
      >
        <Crumbs
          crumbOverrides={crumbOverrides}
          firstAndLastOnly={firstAndLastOnly}
          labelOptions={labelOptions}
          labelTitle={labelTitle}
          onEditHandlers={onEditHandlers}
          pathMap={pathMap}
        />
      </div>
    </div>
  );
};

const removeByIndex = (list: string[], indexToRemove: number) => {
  return list.filter((value, index) => {
    return index !== indexToRemove;
  });
};

export { Breadcrumb };
