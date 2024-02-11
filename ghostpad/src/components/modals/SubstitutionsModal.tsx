import { ChangeEvent, useContext, useEffect } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { SocketContext } from "../SocketProvider";
import { RootState } from "@/store/store";
import { closeModal, updateLocalSubstitutions } from "@/store/uiSlice";
import { Substitution } from "@/types/KoboldConfig";
import { BiCheck, BiX } from "react-icons/bi";
import { koboldConfigMiddleware } from "@/store/koboldConfigMiddleware";
import {
  updateKoboldVar,
  updateLocalSequenceNumber,
} from "@/store/configSlice";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";
import { getSequenceNumber } from "@/util/getSequenceNumber";

export const SubstitutionsModal = () => {
  const { socket } = useContext(SocketContext);
  const socketApi = useContext(SocketApiContext);
  const { modalState, substitutions, localSubstitutions, sequenceNumbers } =
    useSelector((state: RootState) => {
      return {
        modalState: state.ui.modalState,
        substitutions: state.config.koboldConfig?.story?.substitutions,
        localSubstitutions: state.ui.localSubstitutions,
        sequenceNumbers: state.config.sequenceNumbers,
      };
    }, shallowEqual);
  const dispatch = useDispatch();
  const [sequenceNumber, isSynced] = getSequenceNumber(
    "story_substitutions",
    sequenceNumbers
  );

  useEffect(() => {
    const removeSubstitutionUpdateListener =
      koboldConfigMiddleware.startListening({
        actionCreator: updateKoboldVar,
        effect: (action) => {
          if (
            action.payload.classname === "story" &&
            action.payload.name === "substitutions"
          ) {
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
          }
        },
      });

    return () => {
      removeSubstitutionUpdateListener();
    };
  }, [dispatch, localSubstitutions, substitutions, isSynced]);

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

    const validSubstitutions = newLocalSubstitutions.filter(
      (sub) => sub.target !== ""
    );
    dispatch(
      updateLocalSequenceNumber({
        key: "story_substitutions",
        sequenceNumber: sequenceNumber + 1,
      })
    );
    socketApi?.substitutionUpdate(validSubstitutions, sequenceNumber + 1);
  };

  const handleRemove = (idx: number) => {
    if (!socket) return;
    const newLocalSubstitutions = localSubstitutions.map((sub) => ({ ...sub }));
    newLocalSubstitutions.splice(idx, 1);
    dispatch(updateLocalSubstitutions(newLocalSubstitutions));

    const validSubstitutions = newLocalSubstitutions.filter(
      (sub) => sub.target !== ""
    );
    dispatch(
      updateLocalSequenceNumber({
        key: "story_substitutions",
        sequenceNumber: sequenceNumber + 1,
      })
    );
    socketApi?.substitutionUpdate(validSubstitutions, sequenceNumber + 1);
  };

  const handleToggle = (idx: number) => {
    if (!socket) return;
    const newLocalSubstitutions = localSubstitutions.map((sub) => ({ ...sub }));
    newLocalSubstitutions[idx].enabled = !newLocalSubstitutions[idx].enabled;
    dispatch(updateLocalSubstitutions(newLocalSubstitutions));

    const validSubstitutions = newLocalSubstitutions.filter(
      (sub) => sub.target !== ""
    );
    dispatch(
      updateLocalSequenceNumber({
        key: "story_substitutions",
        sequenceNumber: sequenceNumber + 1,
      })
    );
    socketApi?.substitutionUpdate(validSubstitutions, sequenceNumber + 1);
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
