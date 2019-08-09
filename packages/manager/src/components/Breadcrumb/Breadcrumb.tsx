import * as React from 'react';
import { makeStyles } from 'src/components/core/styles';
import Crumbs, { CrumbOverridesProps } from './Crumbs';

import { EditableProps, LabelProps } from './types';

export interface Props {
  labelTitle?: string;
  labelOptions?: LabelProps;
  onEditHandlers?: EditableProps;
  removeCrumbX?: number;
  crumbOverrides?: CrumbOverridesProps[];
  className?: string;
  pathname: string;
}

export type CombinedProps = Props;

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'flex-start'
  },
  preContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    marginTop: -3
  }
});

export const Breadcrumb: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const {
    labelTitle,
    labelOptions,
    onEditHandlers,
    removeCrumbX,
    crumbOverrides,
    className,
    pathname
  } = props;

  const url = pathname && pathname.slice(1);
  const allPaths = url.split('/');

  const pathMap = removeCrumbX
    ? removeByIndex(allPaths, removeCrumbX - 1)
    : allPaths;

  return (
    <div className={`${classes.root} ${className}`}>
      <div className={classes.preContainer}>
        <Crumbs
          pathMap={pathMap}
          onEditHandlers={onEditHandlers}
          crumbOverrides={crumbOverrides}
          labelTitle={labelTitle}
          labelOptions={labelOptions}
        />
      </div>
      {labelOptions &&
        labelOptions.suffixComponent &&
        labelOptions.suffixComponent}
    </div>
  );
};

const removeByIndex = (list: string[], indexToRemove: number) => {
  return list.filter((value, index) => {
    return index !== indexToRemove;
  });
};

export default Breadcrumb;
