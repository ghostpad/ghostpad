import { ChangeEvent, useContext, useEffect } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { SocketContext } from "../SocketProvider";
import { RootState } from "@/store/store";
import { closeModal, updateLocalBiases } from "@/store/uiSlice";
import { BiX } from "react-icons/bi";
import { koboldConfigMiddleware } from "@/store/koboldConfigMiddleware";
import {
  updateKoboldVar,
  updateLocalSequenceNumber,
} from "@/store/configSlice";
import { SocketApi, SocketApiContext } from "@/socketApi/SocketApiProvider";
import {
  LocalBias,
  LocalBiases,
  RemoteBiases,
  localToRemoteBiases,
  remoteToLocalBiases,
} from "@/util/biases";
import { getSequenceNumber } from "@/util/getSequenceNumber";

const BiasListItem = ({
  phrase,
  bias,
  completionThreshold,
  onClose,
  onChange,
}: LocalBias & {
  onClose: () => void;
  onChange: (
    changedKey: "phrase" | "bias" | "completionThreshold",
    evt: ChangeEvent<HTMLInputElement>
  ) => void;
}) => {
  return (
    <li className="p-4 space-y-2 border border-neutral rounded my-2">
      <div className="flex flex-row">
        <input
          placeholder="Phrase"
          className="input input-bordered input-md mr-2 w-full"
          type="text"
          onChange={(evt) => {
            onChange("phrase", evt);
          }}
          value={phrase}
        />
        <button onClick={onClose} className="btn btn-md btn-error">
          <BiX size="1.5em" />
        </button>
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Bias</span>
        </label>
        <input
          type="range"
          step={0.01}
          min={-50}
          max={50}
          value={bias}
          onChange={(evt) => {
            onChange("bias", evt);
          }}
          className="range range-primary"
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Completion Threshold</span>
        </label>
        <input
          type="range"
          step={1}
          min={0}
          max={10}
          value={completionThreshold}
          onChange={(evt) => {
            onChange("completionThreshold", evt);
          }}
          className="range range-primary"
        />
      </div>
    </li>
  );
};
const syncBiases = (
  localBiases: LocalBiases,
  sequenceNumber: number,
  socketApi: SocketApi
) => {
  socketApi?.phraseBiasUpdate(localToRemoteBiases(localBiases), sequenceNumber);
};

export const BiasingModal = () => {
  const { socket } = useContext(SocketContext);
  const socketApi = useContext(SocketApiContext);
  const dispatch = useDispatch();
  const { koboldConfig, sequenceNumbers } = useSelector((state: RootState) => {
    return state.config;
  });
  const biases = koboldConfig.story?.biases as RemoteBiases;
  const { modalState, localBiases } = useSelector((state: RootState) => {
    return {
      modalState: state.ui.modalState,
      localBiases: state.ui.localBiases as LocalBiases,
    };
  }, shallowEqual);
  const [sequenceNumber, isSynced] = getSequenceNumber(
    "story_biases",
    sequenceNumbers
  );
  useEffect(() => {
    const removeBiasUpdateListener = koboldConfigMiddleware.startListening({
      actionCreator: updateKoboldVar,
      effect: (action) => {
        if (
          action.payload.classname === "story" &&
          action.payload.name === "biases"
        ) {
          const updatedBiases = remoteToLocalBiases(
            action.payload.value as RemoteBiases
          );
          const localDrafts: { bias: LocalBias; idx: number }[] =
            localBiases.reduce<{ bias: LocalBias; idx: number }[]>(
              (drafts: { bias: LocalBias; idx: number }[], bias, idx) => {
                if (bias.phrase === "") {
                  drafts.push({ bias, idx });
                }
                return drafts;
              },
              []
            );

          localDrafts.forEach(({ bias, idx }) => {
            updatedBiases.splice(idx, 0, bias);
          });

          dispatch(updateLocalBiases(updatedBiases));
        }
      },
    });

    return () => {
      removeBiasUpdateListener();
    };
  }, [biases, dispatch, localBiases, isSynced]);
  if (!socket || !modalState.biasing.active) return null;

  return (
    <>
      <input type="checkbox" id="biasing-modal" className="modal-toggle" />
      <div className={"modal modal-open"}>
        <div className="modal-box flex flex-col">
          <h3 className="font-bold text-lg">Biasing</h3>
          {!localBiases.length && (
            <div className="text-center mt-6">No biases.</div>
          )}

          {!!localBiases.length && (
            <ul className="overflow-auto flex-row">
              {localBiases.map((bias, idx) => (
                <BiasListItem
                  onChange={(changedKey, evt) => {
                    const newBiases = [
                      ...localBiases.map((bias) => ({ ...bias })),
                    ];
                    if (changedKey === "phrase") {
                      newBiases[idx].phrase = evt.target.value;
                    } else if (changedKey === "bias") {
                      newBiases[idx].bias = parseFloat(evt.target.value);
                    } else if (changedKey === "completionThreshold") {
                      newBiases[idx].completionThreshold = parseInt(
                        evt.target.value
                      );
                    }
                    dispatch(updateLocalBiases(newBiases));
                    dispatch(
                      updateLocalSequenceNumber({
                        key: "story_biases",
                        sequenceNumber: sequenceNumber + 1,
                      })
                    );
                    syncBiases(newBiases, sequenceNumber + 1, socketApi);
                  }}
                  onClose={() => {
                    const newBiases = localBiases.filter((_, i) => i !== idx);
                    dispatch(updateLocalBiases(newBiases));
                    dispatch(
                      updateLocalSequenceNumber({
                        key: "story_biases",
                        sequenceNumber: sequenceNumber + 1,
                      })
                    );
                    syncBiases(newBiases, sequenceNumber + 1, socketApi);
                  }}
                  key={idx}
                  {...bias}
                />
              ))}
            </ul>
          )}

          <div className="modal-action">
            <button
              onClick={() => {
                dispatch(closeModal("biasing"));
              }}
              className="btn"
            >
              Close
            </button>
            <button
              onClick={() => {
                dispatch(
                  updateLocalBiases([
                    ...localBiases,
                    { phrase: "", bias: 0, completionThreshold: 10 },
                  ])
                );
              }}
              className="btn btn-primary"
            >
              Add New
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
