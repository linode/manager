import React from 'react';


export default function Example(props) {
  const { example } = props;
  const { name, value } = example;

  return (
    <div className="Example">
      <div>{name}</div>
      <pre>
        <code>
          {value}
        </code>
      </pre>
    </div>
  );
};
