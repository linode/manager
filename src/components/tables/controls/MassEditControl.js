import React, { Component, PropTypes } from 'react';

import MassEditDropdown from './MassEditDropdown';


export default class MassEditControl extends Component {

  constructor(props) {
    super(props);

    this.onMassEditChange = this.onMassEditChange.bind(this);
  }

  onMassEditChange() {
    const { data, dispatch, objType, selectedKey, toggleSelected } = this.props;
    const selected = data.map(function (record) { return record[selectedKey]; });

    dispatch(toggleSelected(objType, selected));
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
          return {
            name: option.name,
            action: this.createMassEditActionHandler(option.action),
          };
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
  objType: PropTypes.string.isRequired,
  selectedKey: PropTypes.string,
  selectedMap: PropTypes.object.isRequired,
  toggleSelected: PropTypes.func,
};

MassEditControl.defaultProps = {
  selectedKey: 'id',
};
