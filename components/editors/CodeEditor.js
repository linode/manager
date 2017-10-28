import 'brace';
import 'brace/mode/javascript';
import 'brace/theme/tomorrow';
import PropTypes from 'prop-types';
import React from 'react';
import AceEditor from 'react-ace';


export default function CodeEditor(props) {
  return (
    <AceEditor
      mode={props.mode}
      theme="textmate"
      onChange={value => props.onChange({ target: { value, name: props.name } })}
      width="100%"
      showPrintMargin={false}
      value={props.value}
      style={{ border: '1px solid #ccc' }}
      setOptions={{
        enableBasicAutocompletion: false,
        enableLiveAutocompletion: false,
        enableSnippets: false,
        showLineNumbers: true,
        useWorker: false,
        tabSize: 2,
      }}
    />
  );
}

CodeEditor.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
