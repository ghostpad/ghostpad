// The client sends a "Set Selected Text" message to update an action.
// Actions are chunks of text occurring after the prompt.
// When the prompt needs to be changed, MsgVarChange is used instead.

export type MsgSetSelectedText = {
  id: number;
  text: string;
};