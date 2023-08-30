import { RootState } from "@/store/store";
import { useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal } from "@/store/uiSlice";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";

export const SavePresetModal = () => {
  const { modalState } = useSelector((state: RootState) => {
    return state.ui;
  });
  const socketApi = useContext(SocketApiContext);
  const dispatch = useDispatch();
  const [presetName, setPresetName] = useState("");
  const [presetDescription, setPresetDescription] = useState("");
  return !modalState.savePreset.active ? null : (
    <>
      <input type="checkbox" id="save-preset-modal" className="modal-toggle" />
      <div className={"modal modal-open"}>
        <div className="modal-box">
          <input
            type="text"
            className="input input-bordered w-full mb-4"
            placeholder="Name"
            onChange={(e) => {
              setPresetName(e.target.value);
            }}
          />
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="Description"
            onChange={(e) => {
              setPresetDescription(e.target.value);
            }}
          />
          <div className="modal-action">
            <label
              onClick={() => dispatch(closeModal("savePreset"))}
              className="btn"
            >
              Cancel
            </label>
            <label
              onClick={() => {
                socketApi?.saveNewPreset(presetName, presetDescription);
                dispatch(closeModal("savePreset"));
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
