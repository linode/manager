import * as React from 'react';
import { makeStyles } from 'src/components/core/styles';
import '@reach/menu-button/styles.css';
import Settings from '@material-ui/icons/Settings';
import {
  Listbox,
  ListboxPopover,
  ListboxButton,
  ListboxList,
  ListboxOption,
  ListboxGroup
} from '@reach/listbox';
import '@reach/listbox/styles.css';

const useStyles = makeStyles(() => ({
  listbox: {
    position: 'relative'
  }
}));

interface ColumnOption {
  label: string;
  selected?: boolean;
}

interface Props {
  columnOptions: ColumnOption[];
}

export type CombinedProps = Props;

const TableEditor: React.FC<CombinedProps> = props => {
  const { columnOptions } = props;
  const classes = useStyles();

  return (
    <div>
      <span aria-live="assertive" className="visually-hidden"></span>
      <span id="operation" className="visually-hidden">
        Press space bar to toggle drag drop mode, use arrow keys to move
        selected elements.
      </span>

      <Listbox className={classes.listbox}>
        <ListboxButton aria-label="Display settings">
          <Settings />
        </ListboxButton>
        <ListboxPopover portal={false}>
          <ListboxList aria-describedby="operation">
            <ListboxOption value={'detailed list'} draggable={false}>
              Show detailed list view
            </ListboxOption>
            <ListboxOption value={'group by tag'} draggable={false}>
              Group by tag
            </ListboxOption>
            <ListboxGroup label="Display columns:">
              {columnOptions.map(option => {
                return (
                  <ListboxOption value={option.label} draggable={true}>
                    <span>*</span>
                    <input type="checkbox" />
                    {option.label}
                  </ListboxOption>
                );
              })}
            </ListboxGroup>
          </ListboxList>
        </ListboxPopover>
      </Listbox>
    </div>
  );
};

export default React.memo(TableEditor);
