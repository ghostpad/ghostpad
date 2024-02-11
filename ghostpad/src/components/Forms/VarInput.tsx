import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { KoboldConfig } from "@/types/KoboldConfig";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";
import { SyncArrayInput, SyncInput } from "./SyncInput";
import { updateLocalSequenceNumber } from "@/store/configSlice";
import { getSequenceNumber } from "@/util/getSequenceNumber";

export const VarInput = ({
  varName,
  label,
  title,
  type,
  syncOnBlur,
}: {
  varName: string;
  label?: string;
  title?: string;
  type?: string;
  syncOnBlur?: boolean;
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
        string | string[] | number
      >
    )?.[varKey] || "";

  const arrayType = Array.isArray(value);
  if (!["string", "number"].includes(typeof value) && !arrayType)
    throw new Error("Expected value type");
  return arrayType ? (
    <SyncArrayInput
      className="py-2 flex-1 min-w-1/2"
      title={title}
      label={label}
      value={value}
      type={type}
      isSynced={isSynced}
      onBlur={(evt) => {
        if (syncOnBlur) {
          socketApi?.varChange(varName, [evt.target.value], sequenceNumber + 1);
        }
      }}
      onChange={(evt) => {
        if (!syncOnBlur) {
          socketApi?.varChange(varName, [evt.target.value], sequenceNumber + 1);
        }
        dispatch(
          updateLocalSequenceNumber({
            key: varName,
            sequenceNumber: sequenceNumber + 1,
          })
        );
      }}
    />
  ) : (
    <SyncInput
      className="py-2 flex-1 min-w-1/2"
      label={label}
      title={title}
      value={value}
      type={type}
      isSynced={isSynced}
      onBlur={(evt) => {
        if (syncOnBlur) {
          socketApi?.varChange(varName, evt.target.value, sequenceNumber + 1);
        }
      }}
      onChange={(evt) => {
        if (!syncOnBlur) {
          socketApi?.varChange(varName, evt.target.value, sequenceNumber + 1);
        }
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
