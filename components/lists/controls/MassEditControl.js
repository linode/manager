import React, { Component } from 'react';
import PropTypes from 'prop-types';

import MassEditDropdown from './MassEditDropdown';


export default class MassEditControl extends Component {
  onMassEditChange = () => {
    const {
      data, dispatch, objectType, selectedMap, selectedKey, toggleSelected,
    } = this.props;

    const allSelected = this.allSelected();
    const noneSelected = this.noneSelected();
    const indeterminate = !allSelected && !noneSelected;

    let selected = data;

    // Uncheck all those that have been unchecked if in indeterminate state.
    if (indeterminate) {
      selected = selected.filter((record) => {
        return selectedMap[record[selectedKey]];
      });
    }

    selected = selected.map(function (record) { return record[selectedKey]; });

    dispatch(toggleSelected(objectType, selected));
  }

  allSelected = () => this.props.data.every((record) =>
    this.props.selectedMap[record[this.props.selectedKey]])

  createMassEditActionHandler(fn) {
    return () => {
      const { data, selectedMap, selectedKey } = this.props;
      const filteredData = data.filter((record) => { return selectedMap[record[selectedKey]]; });

      fn(filteredData);
    };
  }

  noneSelected = () => (Object.keys(this.props.selectedMap).length === 0)

  render() {
    const { massEditGroups } = this.props;

    const allSelected = this.allSelected();
    const noneSelected = this.noneSelected();

    return (
      <MassEditDropdown
        checked={allSelected && !noneSelected}
        indeterminate={!allSelected && !noneSelected}
        disabled={noneSelected}
        groups={massEditGroups.map((group) => ({
          ...group,
          elements: group.elements.map((option) => ({
            name: option.name,
            action: this.createMassEditActionHandler(option.action),
          })),
        }))}
        onChange={this.onMassEditChange}
      />
    );
  }
}

MassEditControl.propTypes = {
  data: PropTypes.array.isRequired,
  dispatch: PropTypes.func,
  massEditGroups: MassEditDropdown.propTypes.groups,
  objectType: PropTypes.string.isRequired,
  selectedKey: PropTypes.string,
  selectedMap: PropTypes.object.isRequired,
  toggleSelected: PropTypes.func,
};

MassEditControl.defaultProps = {
  selectedKey: 'id',
};
