import { useContext } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { KoboldConfig } from "@/types/KoboldConfig";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";
import { SyncTextarea } from "./SyncTextarea";

export const VarTextarea = ({
  varName,
  label,
  title
}: {
  varName: string;
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
      koboldConfig[varCategory as keyof KoboldConfig] as Record<string, string | number>
    )?.[varKey] || "";
  return (
    <SyncTextarea
      value={value as string}
      timestamp={timestamp}
      onChange={(evt) => {
          socketApi?.varChange(varName, evt.target.value);
      }}
      label={label}
      title={title}
    />
  );
};