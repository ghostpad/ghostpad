import { RootState } from "@/store/store";
import { KoboldConfig } from "@/types/KoboldConfig";
import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";
import { SyncToggle } from "./SyncInput";
import { cx } from "classix";
import { updateLocalSequenceNumber } from "@/store/configSlice";
import { getSequenceNumber } from "@/util/getSequenceNumber";

export const VarToggle = ({
  varName,
  label,
  title,
  className,
}: {
  varName: string;
  className?: string;
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
      koboldConfig[varCategory as keyof KoboldConfig] as Record<
        string,
        boolean | number
      >
    )?.[varKey] || false;

  return (
    <SyncToggle
      className={cx("p-2 flex-grow min-w-1/2", className)}
      title={title}
      label={label}
      value={!!value}
      isSynced={isSynced}
      onChange={(evt) => {
        socketApi?.debouncedVarChange(
          varName,
          evt.target.checked,
          sequenceNumber + 1
        );
        dispatch(
          updateLocalSequenceNumber({
            key: varName,
            sequenceNumber: sequenceNumber + 1,
          })
        );
      }}
    />
  );
};
