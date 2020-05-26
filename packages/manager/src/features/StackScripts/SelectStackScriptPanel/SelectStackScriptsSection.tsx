import { Image } from '@linode/api-v4/lib/images';
import { StackScript } from '@linode/api-v4/lib/stackscripts';
import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import TableRow from 'src/components/core/TableRow';
import { formatDate } from 'src/utilities/format-date-iso8601';
import stripImageName from 'src/utilities/stripImageName';
import truncateText from 'src/utilities/truncateText';
import StackScriptSelectionRow from './StackScriptSelectionRow';

type ClassNames = 'root' | 'loadingWrapper';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    loadingWrapper: {
      border: 0,
      paddingTop: 100
    }
  });

export interface Props {
  onSelect: (s: StackScript) => void;
  selectedId?: number;
  data: StackScript[];
  isSorting: boolean;
  publicImages: Record<string, Image>;
  currentUser: string;
  disabled?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const SelectStackScriptsSection: React.FC<CombinedProps> = props => {
  const { onSelect, selectedId, data, isSorting, classes, disabled } = props;

  const selectStackScript = (s: StackScript) => (
    <StackScriptSelectionRow
      key={s.id}
      label={s.label}
      stackScriptUsername={s.username}
      description={truncateText(s.description, 100)}
      images={stripImageName(s.images)}
      deploymentsActive={s.deployments_active}
      updated={formatDate(s.updated, false)}
      onSelect={() => onSelect(s)}
      checked={selectedId === s.id}
      updateFor={[selectedId === s.id, classes]}
      stackScriptID={s.id}
      disabled={disabled}
    />
  );

  return (
    <TableBody>
      {!isSorting ? (
        data && data.map(selectStackScript)
      ) : (
        <TableRow>
          <TableCell colSpan={5} className={classes.loadingWrapper}>
            <CircleProgress noTopMargin />
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
};

const styled = withStyles(styles);

export default styled(SelectStackScriptsSection) as React.FC<Props>;
