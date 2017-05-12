import React, { Component } from 'react';
import { PropTypes } from 'prop-types';

import MassEditDropdown from './MassEditDropdown';


export default class MassEditControl extends Component {

  constructor(props) {
    super(props);

    this.onMassEditChange = this.onMassEditChange.bind(this);
  }

  onMassEditChange() {
    const { data, dispatch, objectType, selectedKey, toggleSelected } = this.props;
    const selected = data.map(function (record) { return record[selectedKey]; });

    dispatch(toggleSelected(objectType, selected));
  }

  createMassEditActionHandler(fn) {
    return () => {
      const { data, selectedMap } = this.props;
      const filteredData = data.filter((record) => { return selectedMap[record.id]; });

      fn(filteredData);
    };
  }

  render() {
    const {
      data,
      massEditOptions,
      selectedKey,
      selectedMap,
    } = this.props;

    const noneSelected = (Object.keys(selectedMap).length === 0);
    const allSelected = data.every((record) => {
      return selectedMap[record[selectedKey]];
    });

    return (
      <MassEditDropdown
        checked={allSelected}
        disabled={noneSelected}
        options={massEditOptions.map((option) => {
          return option && {
            name: option.name,
            action: this.createMassEditActionHandler(option.action),
          } || option;
        })}
        onChange={this.onMassEditChange}
      />
    );
  }
}

MassEditControl.propTypes = {
  data: PropTypes.array.isRequired,
  dispatch: PropTypes.func,
  massEditOptions: MassEditDropdown.propTypes.options,
  objectType: PropTypes.string.isRequired,
  selectedKey: PropTypes.string,
  selectedMap: PropTypes.object.isRequired,
  toggleSelected: PropTypes.func,
};

MassEditControl.defaultProps = {
  selectedKey: 'id',
};
