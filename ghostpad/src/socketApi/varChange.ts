import { debounce } from "@/util/debounce";
import { Socket } from "socket.io-client";

export const varChangeWithCallback = (
  varName: string,
  value: string | string[] | number | number[] | boolean,
  sequenceNumber: number,
  callback: (() => void) | null = null,
  socket?: Socket
) => {
  socket?.emit(
    "var_change",
    {
      ID: varName,
      value,
      sequence_number: sequenceNumber,
    },
    () => {
      callback?.();
    }
  );
};

// This exists for ease of partial application
// See https://github.com/ramda/ramda/issues/3035#issuecomment-642361662 for more info
export const varChange = (
  varName: string,
  value: string | number | boolean | string[] | number[],
  sequenceNumber: number,
  socket?: Socket
) => varChangeWithCallback(varName, value, sequenceNumber, null, socket);

export const debouncedVarChange = debounce(varChange, 200);
