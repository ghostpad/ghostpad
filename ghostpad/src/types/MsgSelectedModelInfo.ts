import { LoadParameterControl } from "@/store/uiSlice"

// Received when the user clicks a local model.
export type MsgSelectedModelInfo = {
  model_backends: {
    [key: string]: LoadParameterControl[]
  }
}