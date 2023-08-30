export type ActionOption = {
  text: string;
  Pinned: boolean;
  "Previous Selection": boolean;
  Edited: boolean;
};

export type Action = {
    id: number,
    action: {
        "Selected Text": string,
        "Selected Text Length": number,
        Options: ActionOption[],
        "Time": number,
        Probabilities: unknown[],
        "Original Text": string,
    }
};