import React from 'react';


export default function Example(props) {
  const { example } = props;
  
  return (
    <div className="Example">
      <pre>
        <code>
          {example}
        </code>
      </pre>
    </div>
  );
};
