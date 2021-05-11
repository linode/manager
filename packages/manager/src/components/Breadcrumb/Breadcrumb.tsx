import * as classNames from 'classnames';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Crumbs, { CrumbOverridesProps } from './Crumbs';

import { EditableProps, LabelProps } from './types';

export interface Props {
  labelTitle?: string;
  labelOptions?: LabelProps;
  onEditHandlers?: EditableProps;
  removeCrumbX?: number;
  firstAndLastOnly?: boolean;
  crumbOverrides?: CrumbOverridesProps[];
  className?: string;
  pathname: string;
}

export type CombinedProps = Props;

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.only('sm')]: {
      marginLeft: theme.spacing(),
    },
  },
  preContainer: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    minHeight: 48,
  },
  editablePreContainer: {
    alignItems: 'center',
  },
  hasError: {
    marginBottom: theme.spacing(3),
  },
}));

export const Breadcrumb: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const {
    labelTitle,
    labelOptions,
    onEditHandlers,
    removeCrumbX,
    firstAndLastOnly,
    crumbOverrides,
    className,
    pathname,
  } = props;

  const url = pathname && pathname.slice(1);
  const allPaths = url.split('/');

  const pathMap = removeCrumbX
    ? removeByIndex(allPaths, removeCrumbX - 1)
    : allPaths;

  const hasError = Boolean(onEditHandlers?.errorText);

  return (
    <div
      className={classNames({
        [classes.root]: true,
        [classes.hasError]: hasError,
        className,
      })}
    >
      <div
        className={classNames({
          [classes.preContainer]: true,
          [classes.editablePreContainer]: onEditHandlers !== undefined,
        })}
      >
        <Crumbs
          pathMap={pathMap}
          onEditHandlers={onEditHandlers}
          crumbOverrides={crumbOverrides}
          labelTitle={labelTitle}
          labelOptions={labelOptions}
          firstAndLastOnly={firstAndLastOnly}
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

export default Breadcrumb;
