import { ChangeEvent, useState } from "react";

export const SyncTextarea = ({
  value,
  isSynced,
  onChange,
  label,
  disabled,
  title,
}: {
  value: string;
  isSynced: boolean;
  onChange: (evt: ChangeEvent<HTMLTextAreaElement>) => void;
  label?: string;
  title?: string;
  disabled?: boolean;
}) => {
  const [localValue, setLocalValue] = useState<string>(value);
  const displayedValue = isSynced ? value : localValue;
  return (
    <div className="mb-2 flex-grow min-w-1/2" title={title}>
      {label && (
        <div className="flex mb-2">
          <span className="text-sm">{label}</span>
        </div>
      )}
      <textarea
        disabled={disabled}
        value={displayedValue}
        onChange={(evt: ChangeEvent<HTMLTextAreaElement>) => {
          onChange?.(evt);
          setLocalValue(evt.target.value);
        }}
        className="textarea textarea-bordered h-24 bg-base-200 min-w-full max-w-lg p-3 text-sm"
      />
    </div>
  );
};
