import { RootState } from "@/store/store";
import { useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import cx from "classix";
import { BiDownArrowAlt, BiUpArrowAlt } from "react-icons/bi";
import { closeModal } from "@/store/uiSlice";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";
import { updateLocalSequenceNumber } from "@/store/configSlice";
import { getSequenceNumber } from "@/util/getSequenceNumber";

export const SamplerOrderModal = () => {
  const modalState = useSelector((state: RootState) => {
    return state.ui.modalState;
  });
  const { koboldConfig, sequenceNumbers } = useSelector((state: RootState) => {
    return state.config;
  });
  const [sequenceNumber] = getSequenceNumber('model_sampler_order', sequenceNumbers);

  const socketApi = useContext(SocketApiContext);
  const dispatch = useDispatch();
  const samplerLabels = [
    "Top K",
    "Top A",
    "Top P",
    "Tail Free Sampling",
    "Typical Sampling",
    "Temperature",
    "Repetition Penalty",
  ];

  const { sampler_order } = koboldConfig.model || {};
  const [draftSamplerOrder, setDraftSamplerOrder] = useState<number[] | null>(
    null
  );
  const [selectedSampler, setSelectedSampler] = useState<number | null>(null);
  const displayValue =
    draftSamplerOrder === null ? sampler_order : draftSamplerOrder;

  return !modalState.samplerOrder.active ? null : (
    <>
      <input
        type="checkbox"
        id="sampler-order-modal"
        className="modal-toggle"
      />
      <div className={"modal modal-open"}>
        <div className="modal-box flex flex-col">
          <ul className="menu overflow-auto flex-row">
            {displayValue?.map((samplerNum) => {
              return (
                <li
                  className="justify-between flex flex-row w-full"
                  onClick={() => {
                    if (selectedSampler === samplerNum) {
                      setSelectedSampler(null);
                    } else {
                      setSelectedSampler(samplerNum);
                    }
                  }}
                  key={samplerNum}
                >
                  <a
                    className={cx(
                      selectedSampler === samplerNum && "active",
                      "flex items-center text-lg w-full py-4"
                    )}
                  >
                    {samplerLabels[samplerNum]}
                  </a>
                </li>
              );
            })}
          </ul>
          <div className="modal-action justify-between">
            <div className="text-right space-x-2">
              <button
                className="btn"
                onClick={() => {
                  if (selectedSampler === null) return;
                  const newSamplerOrder = [
                    ...(draftSamplerOrder || sampler_order || []),
                  ];
                  const selectedSamplerIdx =
                    newSamplerOrder.indexOf(selectedSampler);
                  const prevIndex =
                    selectedSamplerIdx === 0
                      ? newSamplerOrder.length - 1
                      : selectedSamplerIdx - 1;
                  [
                    newSamplerOrder[selectedSamplerIdx],
                    newSamplerOrder[prevIndex],
                  ] = [
                    newSamplerOrder[prevIndex],
                    newSamplerOrder[selectedSamplerIdx],
                  ];
                  setDraftSamplerOrder(newSamplerOrder);
                }}
              >
                <BiUpArrowAlt size="1.5em" />
              </button>
              <button
                className="btn"
                onClick={() => {
                  if (selectedSampler === null) return;
                  const newSamplerOrder = [
                    ...(draftSamplerOrder || sampler_order || []),
                  ];
                  const selectedSamplerIdx =
                    newSamplerOrder.indexOf(selectedSampler);
                  const nextIndex =
                    selectedSamplerIdx === newSamplerOrder.length - 1
                      ? 0
                      : selectedSamplerIdx + 1;
                  [
                    newSamplerOrder[selectedSamplerIdx],
                    newSamplerOrder[nextIndex],
                  ] = [
                    newSamplerOrder[nextIndex],
                    newSamplerOrder[selectedSamplerIdx],
                  ];
                  setDraftSamplerOrder(newSamplerOrder);
                }}
              >
                {/* An icon here */}
                <BiDownArrowAlt size="1.5em" />
              </button>
            </div>
            <div className="space-x-2">
              <label
                onClick={() => {
                  dispatch(closeModal("samplerOrder"));
                  setDraftSamplerOrder(null);
                  setSelectedSampler(null);
                }}
                className="btn"
              >
                Cancel
              </label>
              <label
                onClick={() => {
                  if (draftSamplerOrder !== null) {
                    socketApi?.varChange(
                      "model_sampler_order",
                      draftSamplerOrder,
                      sequenceNumber + 1
                    );
                    dispatch(
                      updateLocalSequenceNumber({
                        key: "story_story_name",
                        sequenceNumber: sequenceNumber + 1,
                      })
                    );
                  }
                  dispatch(closeModal("samplerOrder"));
                  setDraftSamplerOrder(null);
                  setSelectedSampler(null);
                }}
                className="btn"
              >
                Save
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
