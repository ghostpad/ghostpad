import { ChangeEvent, useContext, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { KoboldConfig } from "@/types/KoboldConfig";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";

export const VarRange = ({
  varName,
  min,
  max,
  step,
  label,
  title
}: {
  varName: string;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  title?: string;
}) => {
  const socketApi = useContext(SocketApiContext);
  const { koboldConfig, timestamps } = useSelector(
    (state: RootState) => state.config
  );
  const [varCategory, ...varKeyParts] = varName.split("_");
  const varKey = varKeyParts.join("_");
  const timestamp = (timestamps[varCategory]?.[varKey] as number) || 0;
  const value =
    (
      koboldConfig[varCategory as keyof KoboldConfig] as Record<string, number>
    )?.[varKey] || 0;
  const [localValue, setLocalValue] = useState<number>(value);
  const [localTimestamp, setLocalTimestamp] = useState<number>(0);
  const displayedValue = timestamp > localTimestamp ? value : localValue;
  return (
    <div className="p-2 flex-grow min-w-1/2" title={title}>
      <div className="flex justify-between mb-2">
        <span className="text-sm">{label}</span>
        <span className="text-sm">{displayedValue}</span>
      </div>
      <input
        type="range"
        step={step}
        min={typeof min === "number" ? min : 0}
        max={typeof max === "number" ? max : 100}
        value={displayedValue}
        onChange={(evt: ChangeEvent<HTMLInputElement>) => {
          setLocalValue(evt.target.valueAsNumber);
          const localTimestamp = Date.now();
          setLocalTimestamp(localTimestamp);
          socketApi?.debouncedVarChange(varName, evt.target.value);
        }}
        className="range range-primary"
      />
    </div>
  );
};