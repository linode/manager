import { WithStyles, withStyles } from '@mui/styles';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose as recompose } from 'recompose';

import { Hidden } from 'src/components/Hidden';
import { RenderGuard, RenderGuardProps } from 'src/components/RenderGuard';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { StackScriptActionMenu } from 'src/features/StackScripts/StackScriptPanel/StackScriptActionMenu';
import { StackScriptCategory } from 'src/features/StackScripts/stackScriptUtils';

import { ClassNames, styles } from '../StackScriptRowHelpers';

export interface Props {
  canAddLinodes: boolean;
  canModify: boolean;
  // change until we're actually using it.
  category: StackScriptCategory | string;
  deploymentsTotal: number;
  description: string;
  images: string[];
  isPublic: boolean;
  label: string;
  stackScriptID: number;
  stackScriptUsername: string;
  triggerDelete: (id: number, label: string) => void;
  triggerMakePublic: (id: number, label: string) => void;
  // @todo: when we implement StackScripts pagination, we should remove "| string" in the type below.
  // Leaving this in as an escape hatch now, since there's a bunch of code in
  // /LandingPanel that uses different values for categories that we shouldn't
  updated: string;
}

export type CombinedProps = Props & WithStyles<ClassNames> & RenderGuardProps;

export const StackScriptRow: React.FC<CombinedProps> = (props) => {
  const {
    canAddLinodes,
    canModify,
    category,
    classes,
    deploymentsTotal,
    description,
    images,
    isPublic,
    label,
    stackScriptID,
    stackScriptUsername,
    triggerDelete,
    triggerMakePublic,
    updated,
  } = props;

  const communityStackScript = category === 'community';

  const renderLabel = () => {
    return (
      <>
        <Link className={classes.link} to={`/stackscripts/${stackScriptID}`}>
          <Typography className={classes.libTitle} variant="h3">
            {stackScriptUsername && (
              <span
                className={`${classes.libRadioLabel} ${classes.stackScriptUsername}`}
              >
                {stackScriptUsername} /&nbsp;
              </span>
            )}
            <span className={classes.libRadioLabel}>{label}</span>
          </Typography>
        </Link>
        {description && (
          <Typography className={classes.libDescription} variant="body1">
            {description}
          </Typography>
        )}
      </>
    );
  };

  return (
    <TableRow
      ariaLabel={label}
      className={classes.row}
      data-qa-table-row={label}
    >
      <TableCell className={classes.libTitle} data-qa-stackscript-title>
        {renderLabel()}
      </TableCell>
      <TableCell>
        <Typography data-qa-stackscript-deploys>{deploymentsTotal}</Typography>
      </TableCell>
      <Hidden smDown>
        <TableCell>
          <Typography data-qa-stackscript-revision>{updated}</Typography>
        </TableCell>
      </Hidden>
      <Hidden lgDown>
        <TableCell className={classes.images} data-qa-stackscript-images>
          {images.includes('any/all') ? 'Any/All' : images.join(',  ')}
        </TableCell>
      </Hidden>
      {communityStackScript ? null : ( // We hide the "Status" column in the "Community StackScripts" tab of the StackScripts landing page since all of those are public.
        <Hidden lgDown>
          <TableCell data-qa-stackscript-status>
            {isPublic ? 'Public' : 'Private'}
          </TableCell>
        </Hidden>
      )}
      <TableCell actionCell className={classes.row}>
        <StackScriptActionMenu
          canAddLinodes={canAddLinodes}
          canModify={canModify}
          category={category}
          isPublic={isPublic}
          stackScriptID={stackScriptID}
          stackScriptLabel={label}
          stackScriptUsername={stackScriptUsername}
          triggerDelete={triggerDelete}
          triggerMakePublic={triggerMakePublic}
        />
      </TableCell>
    </TableRow>
  );
};

export default recompose<CombinedProps, Props & RenderGuardProps>(
  RenderGuard,
  withStyles(styles)
)(StackScriptRow);
