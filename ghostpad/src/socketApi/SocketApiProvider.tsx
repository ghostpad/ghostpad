import * as R from "ramda";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { SocketContext } from "../components/SocketProvider";
import { redo } from "@/socketApi/redo";
import {
  debouncedVarChange,
  varChange,
  varChangeWithCallback,
} from "@/socketApi/varChange";
import { newStory } from "@/socketApi/newStory";
import { back } from "@/socketApi/back";
import { setSelectedText } from "@/socketApi/setSelectedText";
import { retry } from "@/socketApi/retry";
import { submit } from "@/socketApi/submit";
import { addUserscript } from "@/socketApi/addUserscript";
import { deleteStory } from "@/socketApi/deleteStory";
import { overwriteStory, saveStoryWithCallback } from "@/socketApi/saveStory";
import { saveNewPreset } from "@/socketApi/saveNewPreset";
import { abort } from "@/socketApi/abort";
import { useOptionText } from "@/socketApi/useOptionText";
import { loadStory } from "@/socketApi/loadStory";
import { loadStoryList } from "@/socketApi/loadStoryList";
import { loadUserscriptsList } from "@/socketApi/loadUserscriptsList";
import { removeUserscript } from "@/socketApi/removeUserscript";
import { loadModel } from "@/socketApi/loadModel";
import { selectModel } from "@/socketApi/selectModel";
import { createWorldInfoFolder } from "@/socketApi/createWorldInfoFolder";
import {
  createWorldInfoEntry,
  editWorldInfoEntry,
} from "@/socketApi/editWorldInfoEntry";
import { deleteWorldInfoFolder } from "@/socketApi/deleteWorldInfoFolder";
import { renameWorldInfoFolder } from "@/socketApi/renameWorldInfoFolder";
import { deleteWorldInfoEntry } from "@/socketApi/deleteWorldInfoEntry";
import { moveWorldInfoEntry } from "@/socketApi/moveWorldInfoEntry";
import { uploadWorldInfoFolder } from "@/socketApi/uploadWorldInfoFolder";
import { resubmitModelInfo } from "./resubmitModelInfo";
import { generateWI } from "./generateWI";
import { renameStory } from "./renameStory";
import { uploadFile } from "./uploadFile";
import { phraseBiasUpdate } from "./phraseBiasUpdate";
import { substitutionUpdate } from "./substitutionUpdate";

const apiMethods = {
  redo,
  varChange,
  varChangeWithCallback,
  debouncedVarChange,
  newStory,
  back,
  setSelectedText,
  retry,
  submit,
  addUserscript,
  removeUserscript,
  deleteStory,
  saveStoryWithCallback,
  overwriteStory,
  saveNewPreset,
  abort,
  useOptionText,
  loadStory,
  loadStoryList,
  loadUserscriptsList,
  loadModel,
  selectModel,
  createWorldInfoFolder,
  deleteWorldInfoFolder,
  createWorldInfoEntry,
  editWorldInfoEntry,
  renameWorldInfoFolder,
  deleteWorldInfoEntry,
  moveWorldInfoEntry,
  uploadFile,
  uploadWorldInfoFolder,
  resubmitModelInfo,
  generateWI,
  renameStory,
  phraseBiasUpdate,
  substitutionUpdate
};

export type SocketApi = typeof apiMethods | null;

export const SocketApiContext = createContext<SocketApi>(null);

export const SocketApiProvider = ({ children }: PropsWithChildren) => {
  const { socket } = useContext(SocketContext);
  const [socketApi, setSocketApi] = useState<SocketApi>(null);
  useEffect(() => {
    if (!socket) return;
    // All API methods take a socket as the last argument
    // So we can curry them here with Ramda and hide this detail from the rest of the app
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const withSocket = (fn: (...args: any) => void) =>
      R.partialRight(fn, [socket]);

    setSocketApi(R.mapObjIndexed(withSocket, apiMethods));
  }, [socket]);

  return (
    <SocketApiContext.Provider value={socketApi}>
      {children}
    </SocketApiContext.Provider>
  );
};
