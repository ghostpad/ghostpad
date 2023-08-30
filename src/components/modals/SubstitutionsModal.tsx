import { ChangeEvent, useContext, useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { SocketContext } from "../SocketProvider";
import { RootState } from "@/store/store";
import { closeModal, updateLocalSubstitutions } from "@/store/uiSlice";
import { Substitution } from "@/types/KoboldConfig";
import { BiCheck, BiX } from "react-icons/bi";
import { koboldConfigMiddleware } from "@/store/koboldConfigMiddleware";
import { updateKoboldVar } from "@/store/configSlice";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";

export const SubstitutionsModal = () => {
  const { socket } = useContext(SocketContext);
  const socketApi = useContext(SocketApiContext);
  const { timestamps, modalState, substitutions, localSubstitutions } =
    useSelector((state: RootState) => {
      return {
        timestamps: state.config.timestamps,
        modalState: state.ui.modalState,
        substitutions: state.config.koboldConfig?.story?.substitutions,
        localSubstitutions: state.ui.localSubstitutions,
      };
    }, shallowEqual);
  const dispatch = useDispatch();

  // The local representations can have a empty strings for either value, but a sub with an empty target value will not be sent to the server.
  const [localTimestamp, setLocalTimestamp] = useState<number | null>(null);

  useEffect(() => {
    const removeSubstitutionUpdateListener =
      koboldConfigMiddleware.startListening({
        actionCreator: updateKoboldVar,
        effect: (action) => {
          if (
            action.payload.classname === "story" &&
            action.payload.name === "substitutions"
          ) {
            const remoteTimestamp =
              (timestamps.story?.["substitutions"] as number) ?? 0;

            const remoteIsNewest = remoteTimestamp >= (localTimestamp || 0);
            if (remoteIsNewest) {
              const updatedSubstitutions = [
                ...((action.payload.value as Substitution[]) || []),
              ];
              const localDrafts = localSubstitutions.reduce<
                { substitution: Substitution; idx: number }[]
              >((drafts, substitution, idx) => {
                if (substitution.target === "") {
                  drafts.push({ substitution, idx });
                }
                return drafts;
              }, []);

              localDrafts.forEach(({ substitution, idx }) => {
                updatedSubstitutions.splice(idx, 0, substitution);
              });

              dispatch(updateLocalSubstitutions(updatedSubstitutions));
              setLocalTimestamp(Date.now());
            }
          }
        },
      });

    return () => {
      removeSubstitutionUpdateListener();
    };
  }, [
    dispatch,
    localSubstitutions,
    localTimestamp,
    substitutions,
    timestamps.story,
  ]);

  const handleChange = (
    changedKey: "target" | "substitution" | "enabled",
    idx: number,
    evt: ChangeEvent<HTMLInputElement> | null
  ) => {
    if (!socket) return;
    const newLocalSubstitutions = localSubstitutions.map((sub) => ({ ...sub }));
    if (changedKey === "target") {
      newLocalSubstitutions[idx].trueTarget = newLocalSubstitutions[
        idx
      ].target = evt?.target.value || "";
    } else if (changedKey === "substitution") {
      newLocalSubstitutions[idx].substitution = evt?.target.value || "";
    } else if (changedKey === "enabled") {
      newLocalSubstitutions[idx].enabled = evt?.target.checked || false;
    }
    dispatch(updateLocalSubstitutions(newLocalSubstitutions));
    setLocalTimestamp(Date.now());

    const validSubstitutions = newLocalSubstitutions.filter(
      (sub) => sub.target !== ""
    );
    socketApi?.substitutionUpdate(validSubstitutions)
  };

  const handleRemove = (idx: number) => {
    if (!socket) return;
    const newLocalSubstitutions = localSubstitutions.map((sub) => ({ ...sub }));
    newLocalSubstitutions.splice(idx, 1);
    dispatch(updateLocalSubstitutions(newLocalSubstitutions));
    setLocalTimestamp(Date.now());

    const validSubstitutions = newLocalSubstitutions.filter(
      (sub) => sub.target !== ""
    );
    socketApi?.substitutionUpdate(validSubstitutions)
  };

  const handleToggle = (idx: number) => {
    if (!socket) return;
    const newLocalSubstitutions = localSubstitutions.map((sub) => ({ ...sub }));
    newLocalSubstitutions[idx].enabled = !newLocalSubstitutions[idx].enabled;
    dispatch(updateLocalSubstitutions(newLocalSubstitutions));
    setLocalTimestamp(Date.now());

    const validSubstitutions = newLocalSubstitutions.filter(
      (sub) => sub.target !== ""
    );
    socketApi?.substitutionUpdate(validSubstitutions)
  };

  return !modalState.substitutions.active ? null : (
    <>
      <input
        type="checkbox"
        id="substitutions-modal"
        className="modal-toggle"
      />
      <div className={"modal modal-open"}>
        <div className="modal-box flex flex-col">
          <h3 className="font-bold text-lg mb-6">Substitutions</h3>
          <div className="overflow-y-auto">
            {!localSubstitutions.length && (
              <div className="text-center">No substitutions.</div>
            )}
            {localSubstitutions.map((sub, idx) => (
              <div key={idx} className="w-full rounded mb-2 flex space-x-2">
                <button
                  className="btn btn-ghost"
                  onClick={() => handleToggle(idx)}
                >
                  <BiCheck
                    size="1.5em"
                    className={sub.enabled ? "text-primary" : "text-error"}
                  />
                </button>
                <input
                  className="input input-bordered w-full"
                  type="text"
                  placeholder="Target"
                  value={sub.target}
                  onChange={(evt) => handleChange("target", idx, evt)}
                />
                <input
                  className="input input-bordered w-full"
                  type="text"
                  placeholder="Substitution"
                  value={sub.substitution}
                  onChange={(evt) => handleChange("substitution", idx, evt)}
                />
                <button
                  className="btn btn-error"
                  onClick={() => handleRemove(idx)}
                >
                  <BiX size="1.5em" />
                </button>
              </div>
            ))}
          </div>
          <div className="modal-action">
            <button
              onClick={() => {
                dispatch(closeModal("substitutions"));
              }}
              className="btn"
            >
              Close
            </button>
            <button
              onClick={() => {
                dispatch(
                  updateLocalSubstitutions([
                    ...localSubstitutions,
                    {
                      target: "",
                      trueTarget: "",
                      substitution: "",
                      enabled: true,
                    },
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
