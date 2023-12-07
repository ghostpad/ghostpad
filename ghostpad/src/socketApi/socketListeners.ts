import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import { resetStory, updateKoboldVar } from "../store/configSlice";
import { Socket } from "socket.io-client";
import { MsgVarChanged } from "@/types/MsgVarChanged";
import { MsgPopupItems } from "@/types/MsgPopupItems";
import { MsgShowModelMenu } from "@/types/MsgShowModelMenu";
import {
  addStreamTokens,
  openModal,
  setIsLoadingWi,
  updateLastPopup,
  updateLocalModelInfo,
  updateLocalModels,
  updatePopupItems,
} from "../store/uiSlice";
import { MsgSelectedModelInfo } from "@/types/MsgSelectedModelInfo";
import { store } from "@/store/store";
import { Action } from "@/types/Action";
import { MsgLoadPopup } from "@/types/MsgLoadPopup";
import { WorldInfoEntry, WorldInfoFolders } from "@/types/WorldInfo";
import {
  deleteWorldInfoEntry,
  resetWorldInfo,
  updateWorldInfoEntry,
  updateWorldInfoFolders,
  updateStoryCommentary,
} from "../store/worldInfoSlice";
import { StoryCommentary } from "@/types/StoryCommentary";
import { editWorldInfoEntry } from "./editWorldInfoEntry";

export const registerSocketListeners = (
  dispatch: Dispatch<AnyAction>,
  socket?: Socket
) => {
  socket?.on("stream_tokens", (data: string[]) => {
    dispatch(addStreamTokens(data));
  });
  socket?.on("world_info_folder", (data: WorldInfoFolders) => {
    dispatch(updateWorldInfoFolders(data));
  });
  socket?.on("delete_world_info_entry", (data: number) => {
    dispatch(deleteWorldInfoEntry(data));
  });
  socket?.on("world_info_entry", (data: WorldInfoEntry | WorldInfoEntry[]) => {
    dispatch(updateWorldInfoEntry(data));
  });
  socket?.on("generated_wi", (data) => {
    const { worldInfoEntries } = store.getState().worldInfo;
    if (typeof data.uid !== "undefined") {
      const wiEntry = worldInfoEntries[data.uid];
      const updatedEntry = {
        ...wiEntry,
        manual_text: data.out,
      };
      editWorldInfoEntry(updatedEntry, socket);
      dispatch(updateWorldInfoEntry(updatedEntry));
    }
    dispatch(setIsLoadingWi(false));
  });
  socket?.on("reset_story", () => {
    dispatch(resetStory());
    dispatch(resetWorldInfo());
  });
  socket?.on("var_changed", (data: MsgVarChanged) => {
    const [dateStr, microsecondsStr] = data.transmit_time.split(".");
    const isActionUpdate =
      data.classname === "story" && data.name === "actions";
    const koboldConfigTimestamp =
      Date.parse(dateStr) + parseInt(microsecondsStr) / 1000;
    // The timestamp of each config item is always `timestamps[classname][name]: number`
    // ...except for actions, which are tracked individually as `timestamps.story.actions[id]: number`
    const { timestamps } = store.getState().config;
    const lastTimestamp = isActionUpdate
      ? timestamps.story?.actions?.[(data.value as Action).id]
      : (timestamps[data.classname]?.[data.name] as number);
    if (koboldConfigTimestamp < (lastTimestamp || 0)) {
      return;
    }
    dispatch(updateKoboldVar(data));
  });
  socket?.on("show_options", () => {
    const { actions, model } = store.getState().config.koboldConfig;
    const actionCount = actions?.["Action Count"] || 0;
    if ((model?.numseqs ?? 0) > 1) {
      dispatch(
        openModal({
          name: "selectOption",
          data: { actionId: actionCount + 1 },
        })
      );
    }
  });
  socket?.on("load_popup", ({ call_back }: MsgLoadPopup) => {
    dispatch(updateLastPopup(call_back));
  });
  socket?.on("popup_items", (data: MsgPopupItems) => {
    dispatch(updatePopupItems(data));
  });
  socket?.on("open_model_load_menu", ({ items }: MsgShowModelMenu) => {
    dispatch(updateLocalModels(items));
  });
  socket?.on("selected_model_info", (data: MsgSelectedModelInfo) => {
    dispatch(updateLocalModelInfo(data));
  });
  socket?.on("show_story_review", (data: StoryCommentary) => {
    dispatch(updateStoryCommentary(data));
  });
};

export default registerSocketListeners;
