import { RootState } from "@/store/store";
import { closeModal } from "@/store/uiSlice";
import cx from "classix";
import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";

export type SelectOptionModalData = {
  actionId: number | null;
};

export const SelectOptionModal = () => {
  const { modalState } = useSelector((state: RootState) => {
    return state.ui;
  });
  const socketApi = useContext(SocketApiContext);
  const dispatch = useDispatch();
  const data = modalState.selectOption.data as SelectOptionModalData;
  const options = useSelector((state: RootState) => {
    if (
      !state.config.koboldConfig.story?.actions.length ||
      typeof data?.actionId !== "number"
    )
      return [];
    return (
      state.config.koboldConfig.story.actions[data.actionId]?.action.Options ||
      []
    );
  });
  const aiBusy = useSelector((state: RootState) => {
    return state.config.koboldConfig.system?.aibusy;
  });
  const handleOptionClick = (idx: number) => {
    if (aiBusy) {
      socketApi?.abort();
    }
    socketApi?.useOptionText(data.actionId, idx);
    dispatch(closeModal("selectOption"));
  };

  return !modalState.selectOption.active ? null : (
    <>
      <input type="checkbox" id="first-run-modal" className="modal-toggle" />
      <div
        className={cx("modal", modalState.selectOption.active && "modal-open")}
      >
        <div className="modal-box flex flex-col">
          <ul className="menu overflow-auto flex-row">
            {options.map((option, idx) => (
              <li
                key={idx}
                className="w-full border border-neutral rounded mb-2"
              >
                <a onClick={() => handleOptionClick(idx)}>{option.text}</a>
              </li>
            ))}
          </ul>
          <div className="modal-action">
            <label
              onClick={() => {
                dispatch(closeModal("selectOption"));
              }}
              className="btn"
            >
              Cancel
            </label>
          </div>
        </div>
      </div>
    </>
  );
};
