import { StoryCommentary } from "@/types/StoryCommentary";
import {
  WorldInfoEntries,
  WorldInfoEntry,
  WorldInfoFolders,
} from "@/types/WorldInfo";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import * as R from "ramda";

export type WorldInfoState = {
  worldInfoFolders: WorldInfoFolders;
  worldInfoEntries: WorldInfoEntries;
  storyCommentary: StoryCommentary | null;
};

export const worldInfoSlice = createSlice({
  name: "worldInfo",
  initialState: {
    worldInfoFolders: {},
    worldInfoEntries: {},
    storyCommentary: null,
  } as WorldInfoState,
  reducers: {
    resetWorldInfo: () => {
      return {
        worldInfoFolders: {},
        worldInfoEntries: {},
        storyCommentary: null
      };
    },
    deleteWorldInfoEntry: (state, action: PayloadAction<number>) => {
      const uid = action.payload;
      const entries = R.omit([uid.toString()], state.worldInfoEntries);
      return {
        ...state,
        worldInfoEntries: entries,
      };
    },
    updateStoryCommentary: (state, action: PayloadAction<StoryCommentary>) => {
      return {
        ...state,
        storyCommentary: action.payload,
      };
    },
    updateWorldInfoEntry: (
      state,
      action: PayloadAction<WorldInfoEntry | WorldInfoEntry[]>
    ) => {
      // We'll either receive a single entry or an array of entries.
      if (Array.isArray(action.payload)) {
        const entriesUpdate = action.payload.reduce((acc, entry) => {
          const { uid } = entry;
          return {
            ...acc,
            [uid]: entry,
          };
        }, {});
        return {
          ...state,
          worldInfoEntries: {
            ...state.worldInfoEntries,
            ...entriesUpdate,
          },
        };
      } else {
        const entry = action.payload;
        const { uid } = entry;
        return {
          ...state,
          worldInfoEntries: {
            ...state.worldInfoEntries,
            [uid]: entry,
          },
        };
      }
    },
    updateWorldInfoFolders: (
      state,
      action: PayloadAction<WorldInfoFolders>
    ) => {
      const folders = action.payload;
      const entries = { ...state.worldInfoEntries };
      Object.entries(folders).forEach(([folderName, entryUids]) => {
        entryUids.forEach((uid) => {
          if (typeof entries[uid] === "undefined") return;
          entries[uid] = { ...entries[uid], folder: folderName };
        });
      });

      return {
        ...state,
        worldInfoEntries: entries,
        worldInfoFolders: folders,
      };
    },
  },
});

export const {
  updateWorldInfoEntry,
  updateWorldInfoFolders,
  updateStoryCommentary,
  deleteWorldInfoEntry,
  resetWorldInfo
} = worldInfoSlice.actions;
export default worldInfoSlice.reducer;
