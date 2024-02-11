import { ChangeEvent, useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { KoboldConfig } from "@/types/KoboldConfig";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";
import { updateLocalSequenceNumber } from "@/store/configSlice";
import { getSequenceNumber } from "@/util/getSequenceNumber";

export const VarRange = ({
  varName,
  min,
  max,
  step,
  label,
  title,
}: {
  varName: string;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  title?: string;
}) => {
  const socketApi = useContext(SocketApiContext);
  const { koboldConfig, sequenceNumbers } = useSelector(
    (state: RootState) => state.config
  );
  const dispatch = useDispatch();
  const [sequenceNumber, isSynced] = getSequenceNumber(varName, sequenceNumbers);
  const [varCategory, ...varKeyParts] = varName.split("_");
  const varKey = varKeyParts.join("_");
  const value =
    (
      koboldConfig[varCategory as keyof KoboldConfig] as Record<string, number>
    )?.[varKey] || 0;
  const [localValue, setLocalValue] = useState<number>(value);
  const displayedValue = isSynced ? value : localValue;
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
          socketApi?.debouncedVarChange(varName, evt.target.value, sequenceNumber + 1);
          dispatch(
            updateLocalSequenceNumber({
              key: varName,
              sequenceNumber: sequenceNumber + 1,
            })
          );
        }}
        className="range range-primary"
      />
    </div>
  );
};
