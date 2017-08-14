import React, { PropTypes, Component } from 'react';
import TagsInput from 'react-tagsinput';

import Textarea from './Textarea';


export default class Tags extends Component {
  onChange = (value) => {
    const { name, onChange } = this.props;
    onChange({ target: { name, value: value.filter(value => value.length) } });
  }

  renderTag(props) {
    const { tag, key, disabled, onRemove, classNameRemove, getTagDisplayValue, ...other } = props;

    return (
      <span key={key} {...other}>
        {disabled ? null : (
          <a className={classNameRemove} onClick={() => onRemove(key)}>x</a>
        )}
        <span className="Tags-tagText">{getTagDisplayValue(tag)}</span>
      </span>
    );
  }

  render() {
    const { value } = this.props;

    return (
      <div className="Tags">
        {/* This allows us to use this in tests like a normal input. */}
        <input
          type="hidden"
          data-type="tags"
          id={this.props.id}
          name={this.props.name}
          onChange={({ target: { value } }) => this.onChange(value)}
          value={value}
        />
        <TagsInput
          value={value}
          onChange={this.onChange}
          renderInput={Textarea}
          inputProps={{ className: 'Tags-input', placeholder: this.props.placeholder }}
          tagProps={{ className: 'Tags-tag', classNameRemove: 'Tags-remove' }}
          renderTag={this.renderTag}
          focusedClassName="Tags--focused"
          className="Tags-container"
        />
      </div>
    );
  }
}

Tags.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.array.isRequired,
  placeholder: PropTypes.string,
};
