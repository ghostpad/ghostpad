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
  type
}: {
  varName: string;
  label?: string;
  title?: string;
  type?: string;
}) => {
  const { timestamps } = useSelector((state: RootState) => state.config);
  const socketApi = useContext(SocketApiContext);
  const { koboldConfig } = useSelector((state: RootState) => state.config);
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
  if (!["string","number"].includes(typeof value) && !arrayType)
    throw new Error("Expected value type");
  return arrayType ? (
    <SyncArrayInput
      className="py-2 flex-1 min-w-1/2"
      title={title}
      label={label}
      value={value}
      type={type}
      timestamp={timestamp}
      onChange={(evt) => {
        socketApi?.varChange(varName, [evt.target.value]);
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
      onChange={(evt) => {
        socketApi?.varChange(varName, evt.target.value);
      }}
    />
  );
};
