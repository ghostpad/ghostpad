import { DraftWorldInfoEntry, WorldInfoEntry } from "@/types/WorldInfo";

export const defaultWIEntry: DraftWorldInfoEntry = {
  uid: -1,
  title: "New World Info Entry",
  key: [],
  keysecondary: [],
  folder: "root",
  constant: false,
  content: "",
  manual_text: "",
  comment: "",
  token_length: 0,
  selective: false,
  wpp: {
    name: "",
    type: "",
    format: "W++",
    attributes: {},
  },
  use_wpp: false,
  object_type: null,
};

export const createWIEntry = (wiEntry?: Partial<WorldInfoEntry>) => {
  return {
    ...defaultWIEntry,
    ...wiEntry,
    uid: -1,
  };
};
