import React, { useState } from 'react';

interface Props {
  onCreate: (value: number) => Promise<void> | void;
}

export const NewRootForm: React.FC<Props> = ({ onCreate }) => {
  const [value, setValue] = useState('0');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(Number(value));
    setValue('0');
  };

  return (
    <form onSubmit={submit} style={{ marginBottom: 16 }}>
      <label>
        Start number:
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ marginLeft: 4, marginRight: 4 }}
        />
      </label>
      <button type="submit">Publish</button>
    </form>
  );
};