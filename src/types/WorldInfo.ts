// Key: Folder name
// Value: Array of WorldInfo IDs
export type WorldInfoFolders = {
  [key: string]: number[];
};

export type WPPAttributes = {
  [key: string]: string[];
};

export type WPPFormat = "W++" | "Square Bracket Format (SBF)";

export type WorldInfoEntry = {
  comment: string;
  // False when triggered by a keyword.
  constant: boolean;
  // Description of the WI.
  content: string;
  folder: string;
  // Primary keywords.
  key: string[];
  // Secondary keywords.
  keysecondary: string[];
  manual_text: string;
  object_type: string | null;
  selective: boolean;
  title: string;
  token_length: number;
  type: string;
  uid: number;
  use_wpp: boolean;
  used_in_game: boolean;
  wpp: {
    attributes: WPPAttributes;
    format: WPPFormat;
    name: string;
    type: string;
  };
};

// Representation before being created and assigned a UID. Its UID will always be provided as -1.
export type DraftWorldInfoEntry = Omit<WorldInfoEntry, "type" | "used_in_game">;

export type WorldInfoEntries = {
  [key: string]: WorldInfoEntry;
};
