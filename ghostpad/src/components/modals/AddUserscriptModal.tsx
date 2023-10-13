import { useContext, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import cx from "classix";
import { closeModal } from "@/store/uiSlice";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";

export const AddUserscriptModal = () => {
  const socketApi = useContext(SocketApiContext);
  const { modalState, availableUserscripts } = useSelector(
    (state: RootState) => {
      return {
        modalState: state.ui.modalState,
        availableUserscripts: state.ui.availableUserscripts,
      };
    },
    shallowEqual
  );
  const dispatch = useDispatch();
  const [selectedUserscript, setSelectedUserscript] =
    useState<string | null>(null);

  return !modalState.addUserscript.active ? null : (
    <>
      <input
        type="checkbox"
        id="add-userscript-modal"
        className="modal-toggle"
      />
      <div className={"modal modal-open"}>
        <div className="modal-box flex flex-col">
          <h3 className="font-bold text-lg">Add Userscript</h3>

          {availableUserscripts.length === 0 && (
            <div className="text-center mt-6">No userscripts found.</div>
          )}

          {!!availableUserscripts.length && (
            <ul className="menu menu-md overflow-auto flex-row">
              {availableUserscripts.map((userscript) => {
                return (
                  <li
                    className={cx(
                      "w-full",
                      userscript.path === selectedUserscript &&
                        "bg-primary text-primary-content"
                    )}
                    onClick={() => {
                      const newSelection =
                        selectedUserscript === userscript.path
                          ? null
                          : userscript.path;
                      setSelectedUserscript(newSelection);
                    }}
                    key={userscript.path}
                  >
                    <div className="block">
                      <div className="font-bold">{userscript.name}</div>
                      <div>{userscript.description}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="modal-action">
            <button
              onClick={() => {
                dispatch(closeModal("addUserscript"));
              }}
              className="btn"
            >
              Cancel
            </button>
            <button
              disabled={!selectedUserscript}
              onClick={() => {
                socketApi?.addUserscript(selectedUserscript);
                dispatch(closeModal("addUserscript"));
              }}
              className="btn btn-primary"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
