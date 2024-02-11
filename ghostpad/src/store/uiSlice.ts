import { LocalBias, LocalBiases } from "@/util/biases";
import { LibraryItem } from "@/components/modals/LoadFromLibraryModal";
import { HomeSubsection } from "@/types/HomeSection";
import { Substitution } from "@/types/KoboldConfig";
import { LoadModelSubsection } from "@/types/LoadModelSubsection";
import {
  ExtraScriptParams,
  ExtraStoryParams,
  MsgPopupItems,
} from "@/types/MsgPopupItems";
import { MsgSelectedModelInfo } from "@/types/MsgSelectedModelInfo";
import { LocalModel } from "@/types/MsgShowModelMenu";
import { SidebarSection } from "@/types/SidebarSection";
import { WorldInfoEntry } from "@/types/WorldInfo";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type SavedStory = {
  name: string;
  actionCount: number;
  timestamp: number;
  path: string;
  isValid: boolean;
};

export type AvailableUserscript = {
  name: string;
  description: string;
  path: string;
};

export type LoadedFile = {
  name: string;
  filename: string;
  fileType: string;
  content: string | WorldInfoEntry;
  target: string;
};

type ModalName =
  | "saveStory"
  | "overwriteStory"
  | "confirmDeleteLibraryItem"
  | "confirmDeleteStory"
  | "confirmDeleteEntry"
  | "confirmResetEditor"
  | "savePreset"
  | "samplerOrder"
  | "selectOption"
  | "addUserscript"
  | "biasing"
  | "substitutions"
  | "saveToLibrary"
  | "confirmOverwriteLibraryFile"
  | "loadFromLibrary";

type OpenModalPayload = { name: ModalName; data?: unknown };
export type HuggingFaceModel = {
  _id: string;
  id: string;
  private: boolean;
  config: {
    architectures: string[];
    model_type: string;
    task_specific_params: {
      "text-generation": Record<string, unknown>;
    };
  };
  downloads: number;
  pipeline_tag: string;
  modelId: string;
};

export type ModelBackend = {
  name: string;
  loadParameterControls: LoadParameterControl[];
  totalLayers: number;
  layerSliders: string[];
};

export type LoadParameterControl = {
  check: {
    check: string;
    sum: string[];
    value: number;
  };
  children?: { text: string; value: string }[];
  check_message?: string;
  default?: unknown;
  extra_classes: string;
  id: string;
  label: string;
  min?: number;
  max?: number;
  menu_path: string;
  refresh_model_inputs: boolean;
  step?: number;
  tooltip: string;
  uitype: string;
  unit: string;
};

type UiState = {
  lastPopup: string | null;
  availableUserscripts: AvailableUserscript[];
  localBiases: LocalBiases;
  localSubstitutions: Substitution[];
  streamTokens: string[];
  libraryItems: LibraryItem[];
  sidebarState: {
    active: boolean;
    hfDefaultResults: HuggingFaceModel[];
    hfSearchResults: HuggingFaceModel[] | null;
    hiddenEntries: number[];
    isGeneratingWI: boolean;
    localModels: LocalModel[];
    localModelInfo: MsgSelectedModelInfo | null;
    savedStories: SavedStory[];
    selectedModel: LocalModel | null;
    selectedModelBackends: ModelBackend[];
    selectedSubsection: LoadModelSubsection | HomeSubsection | null;
    selectedSection: SidebarSection;
    movingWIEntry: number | null;
    loadedFile: LoadedFile | null;
  };
  modalState: {
    [key in ModalName]: {
      active: boolean;
      data?: unknown;
    };
  };
};

const initialState = {
  lastPopup: null,
  availableUserscripts: [],
  streamTokens: [],
  libraryItems: [],
  localBiases: [],
  localSubstitutions: [],
  modalState: {
    substitutions: { active: false },
    biasing: { active: false },
    samplerOrder: { active: false },
    savePreset: { active: false },
    saveStory: { active: false },
    overwriteStory: { active: false },
    selectOption: { active: false, data: { actionId: null, options: [] } },
    confirmDeleteLibraryItem: { active: false, data: null },
    confirmDeleteStory: { active: false, data: null },
    confirmDeleteEntry: { active: false, data: null },
    confirmResetEditor: { active: false },
    addUserscript: { active: false },
    saveToLibrary: { active: false, data: null },
    confirmOverwriteLibraryFile: { active: false, data: null },
    loadFromLibrary: { active: false, data: null },
  },
  sidebarState: {
    active: false,
    hiddenEntries: [],
    hfDefaultResults: [],
    hfSearchResults: null,
    isGeneratingWI: false,
    localModels: [],
    localModelInfo: null,
    savedStories: [],
    selectedModel: null,
    selectedModelBackends: [],
    selectedSubsection: null,
    selectedSection: SidebarSection.Home,
    movingWIEntry: null,
    loadedFile: null,
  },
} as UiState;
export const uiSlice = createSlice({
  name: "ui",
  initialState: { ...initialState },
  reducers: {
    toggleEntryVisibility: (state, action: PayloadAction<number>) => {
      if (state.sidebarState.hiddenEntries.includes(action.payload)) {
        state.sidebarState.hiddenEntries =
          state.sidebarState.hiddenEntries.filter(
            (id) => id !== action.payload
          );
      } else {
        state.sidebarState.hiddenEntries.push(action.payload);
      }
    },

    // Bias
    updateLocalBiases: (state, action: PayloadAction<LocalBiases>) => {
      state.localBiases = action.payload;
    },
    addLocalBias: (state, action: PayloadAction<LocalBias>) => {
      state.localBiases.push(action.payload);
    },
    removeLocalBias: (state, action: PayloadAction<number>) => {
      state.localBiases.splice(action.payload, 1);
    },
    
    // Substitutions
    updateLocalSubstitutions: (state, action: PayloadAction<Substitution[]>) => {
      state.localSubstitutions = action.payload;
    },
    addLocalSubstitution: (state, action: PayloadAction<Substitution>) => {
      state.localSubstitutions.push(action.payload);
    },
    removeLocalSubstitution: (state, action: PayloadAction<number>) => {
      state.localSubstitutions.splice(action.payload, 1);
    },

    updateLibraryItems: (state, action: PayloadAction<LibraryItem[]>) => {
      state.libraryItems = action.payload;
    },
    updateLastPopup: (state, action: PayloadAction<string | null>) => {
      state.lastPopup = action.payload;
    },
    addStreamTokens: (state, action: PayloadAction<string[]>) => {
      if (!Array.isArray(action.payload)) return;
      state.streamTokens = [...state.streamTokens, ...action.payload];
    },
    clearStreamTokens: (state) => {
      state.streamTokens = [];
    },
    setIsLoadingWi: (state, action: PayloadAction<boolean>) => {
      state.sidebarState.isGeneratingWI = action.payload;
    },
    updateHfDefaultResults: (
      state,
      action: PayloadAction<HuggingFaceModel[]>
    ) => {
      state.sidebarState.hfDefaultResults = action.payload;
    },
    updateHfSearchResults: (
      state,
      action: PayloadAction<HuggingFaceModel[] | null>
    ) => {
      state.sidebarState.hfSearchResults = action.payload;
    },
    updateLocalModelInfo: (
      state,
      action: PayloadAction<MsgSelectedModelInfo>
    ) => {
      const { model_backends: modelBackends } = action.payload;
      const selectedModelBackends = Object.keys(modelBackends).map((name) => {
        const modelBackend = modelBackends[name];
        const validationInfo = modelBackend.find(
          (ui) => ui.uitype === "Valid Display"
        );
        return {
          name,
          loadParameterControls: modelBackend,
          totalLayers: validationInfo?.check.value || 0,
          layerSliders: validationInfo?.check.sum || [],
        };
      });
      state.sidebarState.selectedModelBackends = selectedModelBackends;
    },
    updateLocalModels: (state, action: PayloadAction<LocalModel[]>) => {
      // The response contains menu nav items that we don't need, so we filter them out
      state.sidebarState.localModels = action.payload.filter(
        (model) => model.isMenu === false
      );
    },
    updatePopupItems: (state, action: PayloadAction<MsgPopupItems>) => {
      if (state.lastPopup === "load_story") {
        return {
          ...state,
          sidebarState: {
            ...state.sidebarState,
            savedStories: action.payload.items.map((item) => {
              const extraParams = item[4] as ExtraStoryParams;
              return {
                name: extraParams[0],
                actionCount: extraParams[1],
                timestamp: extraParams[2],
                path: item[1],
                isValid: item[3],
              };
            }),
          },
        };
      } else if (state.lastPopup === "load_userscripts") {
        return {
          ...state,
          availableUserscripts: action.payload.items.map((item) => {
            const extraParams = item[4] as ExtraScriptParams;
            return {
              name: extraParams[0],
              description: extraParams[1],
              path: item[1],
            };
          }),
        };
      }
    },
    updateSelectedModel: (state, action: PayloadAction<LocalModel | null>) => {
      state.sidebarState.selectedModel = action.payload;
      state.sidebarState.selectedModelBackends = [];
    },
    updateSelectedSubsection: (
      state,
      action: PayloadAction<UiState["sidebarState"]["selectedSubsection"]>
    ) => {
      state.sidebarState.selectedSubsection = action.payload;
    },
    updateSelectedSection: (state, action: PayloadAction<SidebarSection>) => {
      state.sidebarState.selectedSection = action.payload;
      state.sidebarState.selectedSubsection = null;
    },
    updateMovingWIEntry: (state, action: PayloadAction<number | null>) => {
      state.sidebarState.movingWIEntry = action.payload;
    },
    updateLoadedFile: (state, action: PayloadAction<LoadedFile | null>) => {
      state.sidebarState.loadedFile = action.payload;
    },
    openSidebar: (state) => {
      state.sidebarState.active = true;
    },
    closeSidebar: (state) => {
      state.sidebarState = initialState.sidebarState;
    },
    openModal: (state, action: PayloadAction<OpenModalPayload>) => {
      const modalState = state.modalState[action.payload.name];
      modalState.active = true;
      modalState.data = action.payload.data;
    },
    closeModal: (state, action: PayloadAction<ModalName>) => {
      state.modalState[action.payload].active = false;
      state.modalState[action.payload].data = null;
    },
  },
});

export const {
  addStreamTokens,
  clearStreamTokens,
  openModal,
  closeModal,
  openSidebar,
  closeSidebar,
  setIsLoadingWi,
  toggleEntryVisibility,
  updateHfDefaultResults,
  updateHfSearchResults,
  updateLastPopup,
  updateLibraryItems,
  updateLoadedFile,
  updateLocalModels,
  updateLocalModelInfo,
  updateMovingWIEntry,
  updatePopupItems,
  updateSelectedModel,
  updateSelectedSubsection,
  updateSelectedSection,
  updateLocalBiases,
  updateLocalSubstitutions,
} = uiSlice.actions;
export default uiSlice.reducer;
