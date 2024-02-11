import { RootState } from "@/store/store";
import { useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, openModal } from "@/store/uiSlice";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";
import { updateLocalSequenceNumber } from "@/store/configSlice";
import { getSequenceNumber } from "@/util/getSequenceNumber";

export const SaveStoryModal = () => {
  const { koboldConfig, sequenceNumbers } = useSelector((state: RootState) => {
    return state.config;
  });
  const storyConfig = koboldConfig.story;
  const [sequenceNumber] = getSequenceNumber('story_story_name', sequenceNumbers);
  const modalState = useSelector((state: RootState) => {
    return state.ui.modalState;
  });

  const storyName = storyConfig?.story_name || "New Story";
  const socketApi = useContext(SocketApiContext);
  const [, setNewName] = useState(storyName);
  const dispatch = useDispatch();
  return !modalState.saveStory.active ? null : (
    <>
      <input type="checkbox" id="save-modal" className="modal-toggle" />
      <div className={"modal modal-open"}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Save Story</h3>
          <p className="py-4">
            <input
              type="text"
              onChange={(e) => {
                setNewName(e.target.value);
                socketApi?.varChange(
                  "story_story_name",
                  e.target.value,
                  sequenceNumber + 1
                );
                dispatch(
                  updateLocalSequenceNumber({
                    key: "story_story_name",
                    sequenceNumber: sequenceNumber + 1,
                  })
                );
              }}
              className="input input-bordered w-full"
              placeholder="Story Name"
              defaultValue={storyName}
            />
          </p>
          <div className="modal-action">
            <label
              onClick={() => {
                dispatch(closeModal("saveStory"));
              }}
              className="btn"
            >
              Cancel
            </label>
            <label
              onClick={() => {
                socketApi?.saveStoryWithCallback((response: string) => {
                  if (response === "overwrite?") {
                    dispatch(openModal({ name: "overwriteStory" }));
                  }
                  dispatch(closeModal("saveStory"));
                });
              }}
              className="btn"
            >
              Save
            </label>
          </div>
        </div>
      </div>
    </>
  );
};
