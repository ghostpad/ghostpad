// The client sends a "var_change" message to update a config entry.

export type MsgVarChange = {
  ID: string;
  value: string | number | unknown[] | Record<string,unknown>;
};