import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { MsgVarChanged } from "@/types/MsgVarChanged";
import { KoboldConfig } from "@/types/KoboldConfig";
import * as R from "ramda";
import { Action } from "@/types/Action";

export type KoboldConfigTimestamps = {
  story?: {
    actions?: {
      [key: number]: number;
    };
    [key: string]: number | { [key: number]: number } | undefined;
  };
  [key: string]:
    | {
        [key: string]: number | { [key: number]: number } | undefined;
      }
    | undefined;
};

export type ReinsertHistoryItem = {
  reinsertQueue: ReinsertQueue;
  anchor: {
    parentIdx: number;
    nodeIdx: number;
    offset: number;
    isAction: boolean;
  };
} | null;

export type GhostpadConfig = {
  theme: string;
  host: string;
  editorGoogleFont: {
    linkFamily: string;
    cssFamily: string;
  };
  editorLocalFont: string;
  editorFontSize: number;
  useGoogleFont: boolean;
  speechSynthesisLanguage: string | null;
  speechSynthesisVoice: string | null;
};

export type ConfigState = {
  ghostpadConfig: GhostpadConfig | null;
  koboldConfig: Partial<KoboldConfig>;
  timestamps: KoboldConfigTimestamps;
  lastNodeCount: number;
  ownActions: OwnAction[];
  loadState: {
    prompt: boolean;
    actions: boolean;
  };
  pendingRetry: boolean;
  pendingInsertion: boolean;
  reinsertQueue: ReinsertQueue;
  reinsertHistory: ReinsertHistoryItem;
  audioInEnabled: boolean;
  audioOutEnabled: boolean;
  utteranceStart: number | null;
  utteranceInProgress: boolean;
  speechSynthesisLanguage: string | null;
  speechSynthesisVoice: string | null;
};

export type OwnAction = {
  id: number | undefined;
  text: string;
  timestamp: number;
};

export type ReinsertQueueItem = {
  key: number | undefined;
  text: string;
};
export type ReinsertQueue = ReinsertQueueItem[];

const initialState: ConfigState = {
  ghostpadConfig: null,
  koboldConfig: {},
  timestamps: {},
  lastNodeCount: 0,
  ownActions: [],
  pendingInsertion: false,
  pendingRetry: false,
  reinsertQueue: [],
  reinsertHistory: null,
  audioInEnabled: false,
  audioOutEnabled: false,
  utteranceStart: null,
  utteranceInProgress: false,
  speechSynthesisLanguage: null,
  speechSynthesisVoice: null,
  // When a story is loaded, the prompt and actions are initiated separately
  // This was added to prevent bugs involving change events firing before the story is fully loaded
  loadState: {
    prompt: false,
    actions: false,
  },
};

export const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    updateGhostpadConfig: (
      state: ConfigState,
      action: PayloadAction<GhostpadConfig>
    ) => ({
      ...state,
      ghostpadConfig: action.payload,
    }),

    setAudioInEnabled: (
      state: ConfigState,
      action: PayloadAction<boolean>
    ) => ({
      ...state,
      audioInEnabled: action.payload,
    }),

    setAudioOutEnabled: (
      state: ConfigState,
      action: PayloadAction<boolean>
    ) => ({
      ...state,
      audioOutEnabled: action.payload,
    }),

    setUtteranceStart: (
      state: ConfigState,
      action: PayloadAction<number | null>
    ) => ({
      ...state,
      utteranceStart: action.payload,
    }),

    setSpeechSynthesisLanguage: (
      state: ConfigState,
      action: PayloadAction<string | null>
    ) =>
      state.ghostpadConfig
        ? {
            ...state,
            ghostpadConfig: {
              ...state.ghostpadConfig,
              speechSynthesisLanguage: action.payload,
            },
          }
        : state,

    setSpeechSynthesisVoice: (
      state: ConfigState,
      action: PayloadAction<string | null>
    ) =>
      state.ghostpadConfig
        ? {
            ...state,
            ghostpadConfig: {
              ...state.ghostpadConfig,
              speechSynthesisVoice: action.payload,
            },
          }
        : state,

    resetStory: (state) => ({
      ...state,
      timestamps: {},
      loadState: {
        prompt: false,
        actions: false,
      },
      lastNodeCount: 0,
      ownActions: [],
    }),

    setNodeCount: (state, action: PayloadAction<number>) => ({
      ...state,
      lastNodeCount: action.payload,
    }),

    setUtteranceInProgress: (
      state: ConfigState,
      action: PayloadAction<boolean>
    ) => ({
      ...state,
      utteranceInProgress: action.payload,
    }),

    updateEditorGoogleFont: (
      state: ConfigState,
      action: PayloadAction<{ linkFamily: string; cssFamily: string }>
    ) =>
      state.ghostpadConfig
        ? {
            ...state,
            ghostpadConfig: {
              ...state.ghostpadConfig,
              editorGoogleFont: action.payload,
            },
          }
        : state,

    updateEditorFont: (state: ConfigState, action: PayloadAction<string>) =>
      state.ghostpadConfig
        ? {
            ...state,
            ghostpadConfig: {
              ...state.ghostpadConfig,
              editorFont: action.payload,
            },
          }
        : state,

    updateEditorFontSize: (state: ConfigState, action: PayloadAction<number>) =>
      state.ghostpadConfig
        ? {
            ...state,
            ghostpadConfig: {
              ...state.ghostpadConfig,
              editorFontSize: action.payload,
            },
          }
        : state,

    updateUseGoogleFont: (state: ConfigState, action: PayloadAction<boolean>) =>
      state.ghostpadConfig
        ? {
            ...state,
            ghostpadConfig: {
              ...state.ghostpadConfig,
              useGoogleFont: action.payload,
            },
          }
        : state,

    updateReinsertHistory: (
      state,
      action: PayloadAction<ReinsertHistoryItem>
    ) => ({
      ...state,
      reinsertHistory: action.payload,
    }),

    updatePendingInsertion: (state, action: PayloadAction<boolean>) => ({
      ...state,
      pendingInsertion: action.payload,
    }),

    updatePendingRetry: (state, action: PayloadAction<boolean>) => ({
      ...state,
      pendingRetry: action.payload,
    }),

    updateReinsertQueue: (state, action: PayloadAction<ReinsertQueue>) => ({
      ...state,
      reinsertQueue: action.payload,
    }),

    updateKoboldConfigTimestamp: (
      state: ConfigState,
      action: PayloadAction<{ id: number; timestamp: number }>
    ) => ({
      ...state,
      timestamps: {
        ...state.timestamps,
        story: {
          ...(state.timestamps.story || {}),
          actions: {
            ...state.timestamps.story?.actions,
            [action.payload.id]: action.payload.timestamp,
          },
        },
      },
    }),

    updateOwnActions: (
      state: ConfigState,
      action: PayloadAction<OwnAction[]>
    ) => ({
      ...state,
      // If we haven't received an action back after 5 seconds, we assume it failed and remove it from the list.
      ownActions: action.payload.filter(
        (ownAction) => Date.now() - ownAction.timestamp < 5000
      ),
    }),

    updateKoboldVar: (
      state: ConfigState,
      action: PayloadAction<MsgVarChanged>
    ) => {
      const { koboldConfig, timestamps, lastNodeCount, loadState, ownActions } =
        state;
      const updatedOwnActions = [...ownActions];
      const isActionUpdate =
        action.payload.classname === "story" &&
        action.payload.name === "actions";
      const isPromptUpdate =
        action.payload.classname === "story" &&
        action.payload.name === "prompt_wi_highlighted_text";
      const isAiBusyChange =
        action.payload.classname === "system" &&
        action.payload.name === "aibusy";

      const [dateStr, microsecondsStr] =
        action.payload.transmit_time.split(".");
      const koboldConfigTimestamp =
        Date.parse(dateStr) + parseInt(microsecondsStr) / 1000;

      if (isAiBusyChange) {
        if (
          action.payload.value === false &&
          koboldConfig.system?.noai === false
        ) {
          if (koboldConfig.story?.actions.length) {
            return {
              ...state,
              koboldConfig: {
                ...koboldConfig,
                system: {
                  ...(koboldConfig as KoboldConfig).system,
                  aibusy: false,
                },
              },
            };
          }
        } else if (action.payload.value === true) {
          return {
            ...state,
            koboldConfig: {
              ...koboldConfig,
              system: {
                ...(koboldConfig as KoboldConfig).system,
                aibusy: true,
              },
            },
            ownActions: [],
          };
        }
      }

      if (isActionUpdate || isPromptUpdate) {
        if (isPromptUpdate && action.payload.old_value !== null) return state;
      }

      const update: Partial<KoboldConfig> = {
        [action.payload.classname]: {
          [action.payload.name]: action.payload.value,
        },
      };

      const timestampUpdate: KoboldConfigTimestamps = {
        [action.payload.classname]: {
          [action.payload.name]: koboldConfigTimestamp,
        },
      };

      if (
        isActionUpdate &&
        typeof action.payload.value === "object" &&
        update.story
      ) {
        const value = action.payload.value as Action;
        if (!Array.isArray(value) && typeof value.id === "number") {
          update.story.actions = [...(koboldConfig.story?.actions || [])];
          const existingActionIdx = update.story.actions.findIndex(
            (action) => action.id === value.id
          );
          const existingAction = update.story.actions[existingActionIdx] || {};
          if (existingAction.id >= 0) {
            update.story.actions[existingActionIdx] = {
              ...existingAction,
              action: value.action,
            };
          } else {
            update.story.actions.push(value);
          }

          timestampUpdate.story ||= {};
          timestampUpdate.story.actions = {
            ...(timestamps.story?.actions || {}),
            [value.id]: koboldConfigTimestamp,
          };
        }
      }
      const updatedKoboldConfigClass = R.mergeRight(
        koboldConfig[action.payload.classname as keyof KoboldConfig] || {},
        update[action.payload.classname as keyof KoboldConfig] || {}
      );
      const updatedKoboldConfig = R.mergeRight(koboldConfig, {
        [action.payload.classname]: updatedKoboldConfigClass,
      });
      const updatedTimestamps = R.mergeDeepRight(timestamps, timestampUpdate);
      return {
        ...state,
        koboldConfig: updatedKoboldConfig,
        timestamps: updatedTimestamps,
        loadState: {
          prompt: isPromptUpdate ? true : loadState.prompt,
          actions: isActionUpdate ? true : loadState.actions,
        },
        lastNodeCount: lastNodeCount ?? 0,
        ownActions: updatedOwnActions,
      } as ConfigState;
    },
  },
});

export const {
  updateGhostpadConfig,
  updateReinsertQueue,
  updateKoboldVar,
  setNodeCount,
  updateKoboldConfigTimestamp,
  updateOwnActions,
  updatePendingInsertion,
  updatePendingRetry,
  updateReinsertHistory,
  updateEditorFont,
  updateEditorFontSize,
  updateEditorGoogleFont,
  updateUseGoogleFont,
  resetStory,
  setAudioInEnabled,
  setAudioOutEnabled,
  setUtteranceStart,
  setUtteranceInProgress,
  setSpeechSynthesisLanguage,
  setSpeechSynthesisVoice,
} = configSlice.actions;
export default configSlice.reducer;
