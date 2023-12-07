import { useContext } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { KoboldConfig } from "@/types/KoboldConfig";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";
import { SyncArrayInput, SyncInput } from "./SyncInput";

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
  const timestamps = useSelector((state: RootState) => state.config.timestamps);
  const socketApi = useContext(SocketApiContext);
  const koboldConfig = useSelector(
    (state: RootState) => state.config.koboldConfig
  );
  const [varCategory, ...varKeyParts] = varName.split("_");
  const varKey = varKeyParts.join("_");
  const value =
    (
      koboldConfig[varCategory as keyof KoboldConfig] as Record<
        string,
        string | string[] | number
      >
    )?.[varKey] || "";
  const timestamp = timestamps[varCategory]?.[varKey] as number;

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
      timestamp={timestamp}
      onBlur={(evt) => {
        if (syncOnBlur) {
          socketApi?.varChange(varName, [evt.target.value]);
        }
      }}
      onChange={(evt) => {
        if (!syncOnBlur) {
          socketApi?.varChange(varName, [evt.target.value]);
        }
      }}
    />
  ) : (
    <SyncInput
      className="py-2 flex-1 min-w-1/2"
      label={label}
      title={title}
      value={value}
      type={type}
      timestamp={timestamp}
      onBlur={(evt) => {
        if (syncOnBlur) {
          socketApi?.varChange(varName, evt.target.value);
        }
      }}
      onChange={(evt) => {
        if (!syncOnBlur) {
          socketApi?.varChange(varName, evt.target.value);
        }
      }}
    />
  );
};
