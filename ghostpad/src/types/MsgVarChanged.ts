// The server sends a "var_changed" message when a variable changes.

import { Action } from "./Action";

export type MsgVarChanged = {
  classname: string;
  name: string;
  old_value: unknown;
  value: string | boolean | number | unknown[] | Record<string,unknown> | Action;
  transmit_time: string;
}