import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { KoboldConfig } from "@/types/KoboldConfig";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";
import { SyncTextarea } from "./SyncTextarea";
import { updateLocalSequenceNumber } from "@/store/configSlice";
import { getSequenceNumber } from "@/util/getSequenceNumber";

export const VarTextarea = ({
  varName,
  label,
  title,
}: {
  varName: string;
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
        string | number
      >
    )?.[varKey] || "";
  return (
    <SyncTextarea
      value={value as string}
      isSynced={isSynced}
      onChange={(evt) => {
        socketApi?.varChange(varName, evt.target.value, sequenceNumber + 1);
        dispatch(
          updateLocalSequenceNumber({
            key: varName,
            sequenceNumber: sequenceNumber + 1,
          })
        );
      }}
      label={label}
      title={title}
    />
  );
};
