import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { MsgVarChanged } from "@/types/MsgVarChanged";
import { KoboldConfig } from "@/types/KoboldConfig";
import * as R from "ramda";
import { Action } from "@/types/Action";

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

// A tuple of [sequenceNumber, isSynced]
export type SequenceNumbers = {
  [K in string]: [number, boolean] | { [K in string]: [number, boolean] };
} & {
  story_actions: { [K in string]: [number, boolean] };
};

export type ConfigState = {
  ghostpadConfig: GhostpadConfig | null;
  koboldConfig: Partial<KoboldConfig>;
  lastNodeCount: number;
  sequenceNumbers: SequenceNumbers;
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

export type ReinsertQueueItem = {
  key: number | undefined;
  text: string;
};
export type ReinsertQueue = ReinsertQueueItem[];

const initialState: ConfigState = {
  ghostpadConfig: null,
  koboldConfig: {},
  sequenceNumbers: {
    story_actions: {},
  },
  lastNodeCount: 0,
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
      sequenceNumbers: {
        story_actions: {},
      },
      loadState: {
        prompt: false,
        actions: false,
      },
      lastNodeCount: 0,
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

    updateLocalSequenceNumber: (
      state: ConfigState,
      action: PayloadAction<{
        key: string;
        sequenceNumber: number;
        actionId?: number;
      }>
    ) => {
      if (
        action.payload.key === "story_actions" &&
        typeof action.payload.actionId !== "undefined"
      ) {
        state.sequenceNumbers.story_actions[action.payload.actionId] = [
          action.payload.sequenceNumber,
          false,
        ];
      } else {
        state.sequenceNumbers[action.payload.key] = [
          action.payload.sequenceNumber,
          false,
        ];
      }
      return state;
    },

    updateKoboldVar: (
      state: ConfigState,
      action: PayloadAction<MsgVarChanged>
    ) => {
      const { koboldConfig, loadState } = state;
      const isActionUpdate =
        action.payload.classname === "story" &&
        action.payload.name === "actions";
      const isPromptUpdate =
        action.payload.classname === "story" &&
        action.payload.name === "prompt_wi_highlighted_text";
      const isAiBusyChange =
        action.payload.classname === "system" &&
        action.payload.name === "aibusy";

      const sequenceNumberKey = `${action.payload.classname}_${action.payload.name}`;

      if (typeof action.payload.sequence_number === "number" && !isActionUpdate) {
        state.sequenceNumbers[sequenceNumberKey] = [
          action.payload.sequence_number,
          true,
        ];
      }

      if (isAiBusyChange && state.koboldConfig.system) {
        state.koboldConfig.system.aibusy = !!action.payload.value;
        return state;
      }

      if (isPromptUpdate && action.payload.old_value !== null) return state;

      const update: Partial<KoboldConfig> = {
        [action.payload.classname]: {
          [action.payload.name]: action.payload.value,
        },
      };

      if (
        isActionUpdate &&
        typeof action.payload.value === "object" &&
        !Array.isArray(action.payload.value)
      ) {
        const value = action.payload.value as Action;
        const story = update.story!;
        story.actions = [...(koboldConfig.story?.actions || [])];
        const existingActionIdx = story.actions.findIndex(
          (action) => action.id === value.id
        );
        const existingAction = story.actions[existingActionIdx] || {};
        if (existingAction.id >= 0) {
          story.actions[existingActionIdx] = {
            ...existingAction,
            action: value.action,
          };
        } else {
          story.actions.push(value);
        }
        state.sequenceNumbers["story_actions"][value.id] = [
          action.payload.sequence_number,
          true,
        ];
      }

      const koboldConfigUpdate: Partial<KoboldConfig> = {
        [action.payload.classname]: R.mergeRight(
          koboldConfig[action.payload.classname as keyof KoboldConfig] || {},
          update[action.payload.classname as keyof KoboldConfig] || {}
        ),
      };

      state.koboldConfig = R.mergeRight(koboldConfig, koboldConfigUpdate);
      state.loadState = {
        prompt: isPromptUpdate ? true : loadState.prompt,
        actions: isActionUpdate ? true : loadState.actions,
      };
      return state;
    },
  },
});

export const {
  updateGhostpadConfig,
  updateReinsertQueue,
  updateKoboldVar,
  setNodeCount,
  updateLocalSequenceNumber,
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
