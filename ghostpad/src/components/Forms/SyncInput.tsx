import { ChangeEvent, InputHTMLAttributes, useState } from "react";

export const SyncInput = ({
  value,
  timestamp,
  onChange,
  className,
  label,
  title,
  inputClassname,
  ...args
}: Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  value: string | number;
  timestamp: number;
  label?: string;
  title?: string;
  inputClassname?: string;
  onChange?: (evt: ChangeEvent<HTMLInputElement>, localValue: string) => void;
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [localTimestamp, setLocalTimestamp] = useState<number>(0);
  const displayedValue = timestamp > localTimestamp + 500 ? value : localValue;
  return (
    <div className={className} title={title}>
      {label && (
        <div className="flex mb-2">
          <span className="text-sm">{label}</span>
        </div>
      )}
      <input
        type="text"
        value={displayedValue}
        onChange={(evt: ChangeEvent<HTMLInputElement>) => {
          onChange?.(evt, localValue as string);
          setLocalValue(evt.target.value);
          const localTimestamp = Date.now();
          setLocalTimestamp(localTimestamp);
        }}
        className={inputClassname || "input input-sm input-bordered bg-base-200 text-sm w-full placeholder:italic"}
        {...args}
      />
    </div>
  );
};

// For genre input where the data is represented as an array
// For the sake of simplicity, Ghostpad uses a single element array ["comma,separated,values"] which results in exactly the same input to the AI.
export const SyncArrayInput = ({
  value,
  timestamp,
  onChange,
  className,
  label,
  title,
  ...args
}: Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  timestamp: number;
  value: string[];
  label?: string;
  title?: string;
  onChange?: (evt: ChangeEvent<HTMLInputElement>, localValue: string[]) => void;
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [localTimestamp, setLocalTimestamp] = useState<number>(0);
  const displayedValue = (timestamp > localTimestamp + 500 ? value : localValue).join(
    ", "
  );
  return (
    <div className={className} title={title}>
      {label && (
        <div className="flex mb-2">
          <span className="text-sm">{label}</span>
        </div>
      )}
      <input
        type="text"
        value={displayedValue}
        onChange={(evt: ChangeEvent<HTMLInputElement>) => {
          onChange?.(evt, localValue);
          setLocalValue([evt.target.value]);
          const localTimestamp = Date.now();
          setLocalTimestamp(localTimestamp);
        }}
        className="input input-sm input-bordered bg-base-200 text-sm w-full placeholder:italic"
        {...args}
      />
    </div>
  );
};

export const SyncToggle = ({
  value,
  timestamp,
  onChange,
  className,
  label,
  title,
  ...args
}: Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  timestamp: number;
  value: boolean;
  label?: string;
  title?: string;
  onChange?: (evt: ChangeEvent<HTMLInputElement>, localValue: boolean) => void;
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [localTimestamp, setLocalTimestamp] = useState<number>(0);
  const displayedValue = timestamp > localTimestamp + 500 ? value : localValue;
  return (
    <div className={className} title={title}>
      {label && (
        <div className="flex justify-between mb-2">
          <span className="text-sm">{label}</span>
        </div>
      )}
      <input
        type="checkbox"
        checked={displayedValue}
        onChange={(evt: ChangeEvent<HTMLInputElement>) => {
          onChange?.(evt, localValue);
          setLocalValue(evt.target.checked);
          const localTimestamp = Date.now();
          setLocalTimestamp(localTimestamp);
        }}
        className="toggle mb-2"
        {...args}
      />
    </div>
  );
};