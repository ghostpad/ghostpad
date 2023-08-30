import { closeModal } from "@/store/uiSlice";
import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";

export const OverwriteModal = () => {
  const socketApi = useContext(SocketApiContext);
  const { modalState } = useSelector((state: RootState) => {
    return state.ui;
  });
  const dispatch = useDispatch();

  return !modalState.overwriteStory.active ? null : (
    <>
      <input type="checkbox" id="overwrite-modal" className="modal-toggle" />
      <div className={"modal modal-open"}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Save Story</h3>
          <p className="py-4">
            A story with this name already exists. Do you want to overwrite it?
          </p>
          <div className="modal-action">
            <label
              onClick={() => {
                dispatch(closeModal("overwriteStory"));
              }}
              className="btn"
            >
              Cancel
            </label>
            <label
              onClick={() => {
                socketApi?.overwriteStory();
                dispatch(closeModal("overwriteStory"));
              }}
              className="btn"
            >
              Overwrite
            </label>
          </div>
        </div>
      </div>
    </>
  );
};
