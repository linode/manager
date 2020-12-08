import * as classNames from 'classnames';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import useFlags from 'src/hooks/useFlags';
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
    alignItems: 'flex-start'
  },
  preContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    marginTop: -3
  },
  editablePreContainer: {
    alignItems: 'flex-start'
  },
  cmrSpacing: {
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing()
    }
  }
}));

export const Breadcrumb: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const flags = useFlags();

  const {
    labelTitle,
    labelOptions,
    onEditHandlers,
    removeCrumbX,
    firstAndLastOnly,
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
      <div
        className={classNames({
          [classes.preContainer]: true,
          [classes.editablePreContainer]: onEditHandlers !== undefined,
          [classes.cmrSpacing]: flags.cmr
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
