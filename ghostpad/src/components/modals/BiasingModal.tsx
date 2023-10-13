import { ChangeEvent, useContext, useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { SocketContext } from "../SocketProvider";
import { RootState } from "@/store/store";
import { closeModal, updateLocalBiases } from "@/store/uiSlice";
import { BiX } from "react-icons/bi";
import { koboldConfigMiddleware } from "@/store/koboldConfigMiddleware";
import { updateKoboldVar } from "@/store/configSlice";
import { SocketApi, SocketApiContext } from "@/socketApi/SocketApiProvider";

// We use a different internal data structure for biases than in Kobold.
// Kobold stores biases as tuples in an object with the phrase as the key. { [phrase: string]: [bias: number, completionThreshold: number] }
// But we want to be able to temporarily store biases containing duplicate phrases, so items don't disappear during typing the moment they have a key collision.
export type LocalBias = {
  phrase: string;
  bias: number;
  completionThreshold: number;
};

export type LocalBiases = LocalBias[];

export type RemoteBiases = {
  [key: string]: [number, number];
};

export const localToRemoteBiases = (localBiases: LocalBiases): RemoteBiases => {
  return localBiases.reduce(
    (acc: RemoteBiases, localBias) =>
      localBias.phrase.length
        ? {
            ...acc,
            [localBias.phrase]: [localBias.bias, localBias.completionThreshold],
          }
        : acc,
    {}
  );
};

export const remoteToLocalBiases = (remoteBiases: RemoteBiases): LocalBiases =>
  remoteBiases
    ? Object.entries(remoteBiases).map(
        ([phrase, [bias, completionThreshold]]) => ({
          phrase,
          bias,
          completionThreshold,
        })
      )
    : [];

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
const syncBiases = (localBiases: LocalBiases, socketApi: SocketApi) => {
  socketApi?.phraseBiasUpdate(localToRemoteBiases(localBiases));
};

export const BiasingModal = () => {
  const { socket } = useContext(SocketContext);
  const socketApi = useContext(SocketApiContext);
  const dispatch = useDispatch();
  const [localTimestamp, setLocalTimestamp] = useState<number | null>(null);
  const { modalState, timestamps, biases, localBiases } = useSelector(
    (state: RootState) => {
      return {
        timestamps: state.config.timestamps,
        modalState: state.ui.modalState,
        biases: state.config.koboldConfig.story?.biases as RemoteBiases,
        localBiases: state.ui.localBiases,
      };
    },
    shallowEqual
  );
  useEffect(() => {
    const removeBiasUpdateListener = koboldConfigMiddleware.startListening({
      actionCreator: updateKoboldVar,
      effect: (action) => {
        if (
          action.payload.classname === "story" &&
          action.payload.name === "biases"
        ) {
          const remoteTimestamp = (timestamps.story?.biases as number) ?? 0;

          const remoteIsNewest = remoteTimestamp >= (localTimestamp || 0);
          if (remoteIsNewest) {
            const updatedBiases = remoteToLocalBiases(
              action.payload.value as RemoteBiases
            );
            const localDrafts = localBiases.reduce<
              { bias: LocalBias; idx: number }[]
            >((drafts, bias, idx) => {
              if (bias.phrase === "") {
                drafts.push({ bias, idx });
              }
              return drafts;
            }, []);

            localDrafts.forEach(({ bias, idx }) => {
              updatedBiases.splice(idx, 0, bias);
            });

            dispatch(updateLocalBiases(updatedBiases));
            setLocalTimestamp(Date.now());
          }
        }
      },
    });

    return () => {
      removeBiasUpdateListener();
    };
  }, [biases, dispatch, localBiases, localTimestamp, timestamps.story?.biases]);
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
                    setLocalTimestamp(Date.now());
                    syncBiases(newBiases, socketApi);
                  }}
                  onClose={() => {
                    const newBiases = localBiases.filter((_, i) => i !== idx);
                    dispatch(updateLocalBiases(newBiases));
                    setLocalTimestamp(Date.now());
                    syncBiases(newBiases, socketApi);
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
                setLocalTimestamp(Date.now());
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
