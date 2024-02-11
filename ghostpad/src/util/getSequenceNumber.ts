import { SequenceNumbers } from "@/store/configSlice";

export const getSequenceNumber = (
  key: string,
  sequenceNumbers: SequenceNumbers,
  actionId?: number
): [number, boolean] => {
  if (key === "story_actions" && typeof actionId !== "undefined") {
    return actionId in sequenceNumbers.story_actions
      ? sequenceNumbers.story_actions[actionId]
      : [0, false];
  } else if (key !== "story_actions" && key in sequenceNumbers) {
    return sequenceNumbers[key] as [number, boolean];
  } else {
    return [0, false];
  }
};
