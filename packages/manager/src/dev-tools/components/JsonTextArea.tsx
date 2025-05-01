import * as React from 'react';

interface JsonTextAreaProps {
  height?: number;
  label?: string;
  name: string;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  value: unknown;
}

export const JsonTextArea = ({
  height,
  label,
  name,
  onChange,
  value,
}: JsonTextAreaProps) => {
  const [rawText, setRawText] = React.useState(JSON.stringify(value, null, 2));

  const debouncedUpdate = React.useMemo(
    () =>
      debounce((text: string) => {
        try {
          const parsedJson = JSON.parse(text);
          const event = {
            currentTarget: {
              name,
              value: parsedJson,
            },
            target: {
              name,
              value: parsedJson,
            },
          } as React.ChangeEvent<HTMLTextAreaElement>;

          onChange(event);
        } catch (err) {
          // Only warn if the text isn't empty and isn't in the middle of editing
          if (text.trim()) {
            // eslint-disable-next-line no-console
            console.warn(`Invalid JSON in ${name}, error: ${err}`);
          }
        }
      }, 500),
    [name, onChange]
  );

  React.useEffect(() => {
    const newText = JSON.stringify(value, null, 2);
    if (newText !== rawText) {
      setRawText(newText);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setRawText(newText);
    debouncedUpdate(newText);
  };

  return (
    <label>
      {label || name}
      <textarea
        name={name}
        onChange={handleChange}
        style={{
          fontFamily: 'monospace',
          minHeight: height ? `${height}px` : undefined,
          whiteSpace: 'pre',
        }}
        value={rawText}
      />
    </label>
  );
};

function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
