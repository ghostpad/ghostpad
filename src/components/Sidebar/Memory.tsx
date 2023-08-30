import { VarTextarea } from "../Forms/VarTextarea";
import { VarInput } from "../Forms/VarInput";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { openModal, updateLoadedFile } from "@/store/uiSlice";
import { RootState } from "@/store/store";
import { useContext, useEffect } from "react";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";
import { BiNotepad } from "react-icons/bi";
import { VarToggle } from "../Forms/VarToggle";
import { VarRange } from "../Forms/VarRange";

export const Memory = () => {
  const dispatch = useDispatch();
  const socketApi = useContext(SocketApiContext);
  const { memory, authornote, loadedFile } = useSelector((state: RootState) => {
    return {
      memory: state.config.koboldConfig.story?.memory || "",
      authornote: state.config.koboldConfig.story?.authornote || "",
      loadedFile: state.ui.sidebarState.loadedFile,
    };
  }, shallowEqual);

  useEffect(() => {
    if (!loadedFile) return;
    if (loadedFile?.target === "memory") {
      socketApi?.varChange(
        "story_memory",
        memory + (memory.length ? "\n\n" : "") + loadedFile.content
      );
      dispatch(updateLoadedFile(null));
    }

    if (loadedFile?.target === "authornote") {
      socketApi?.varChange(
        "story_authornote",
        authornote + (authornote.length ? "\n\n" : "") + loadedFile.content
      );
      dispatch(updateLoadedFile(null));
    }
  }, [authornote, dispatch, loadedFile, memory, socketApi]);

  return (
    <div className="flex-grow px-6 py-3">
      <h2 className="px-6 pb-3 font-bold text-center">Story Settings</h2>
      <VarTextarea
        varName="story_memory"
        label="Memory"
        title="Important information the AI should always keep in mind."
      />
      <div className="flex justify-between space-x-2">
        <button
          className="btn flex-1"
          onClick={() => {
            dispatch(
              openModal({
                name: "loadFromLibrary",
                data: { fileType: "text", target: "memory" },
              })
            );
          }}
          title="Load a memory from the text library. This will append it to the current text, so you can combine multiple items."
        >
          <BiNotepad size="1.5em" />
          Load
        </button>
        <button
          className="btn flex-1"
          onClick={() => {
            dispatch(
              openModal({
                name: "saveToLibrary",
                data: { fileType: "text", content: memory },
              })
            );
          }}
          title="Save the memory to the text library."
        >
          <BiNotepad size="1.5em" />
          Save
        </button>
      </div>
      <VarInput
        varName="story_authornotetemplate"
        label="Author's Note Template"
        title="This is how your author's note will be formatted when it is submitted to the AI. Use <|> as a placeholder for the author's note itself."
      />
      <VarTextarea
        varName="story_authornote"
        label="Author's Note"
        title="Notes to influence the writing style, story plot, or AI behavior."
      />
      <div className="flex justify-between space-x-2">
        <button
          className="btn flex-1"
          onClick={() => {
            dispatch(
              openModal({
                name: "loadFromLibrary",
                data: { fileType: "text", target: "authornote" },
              })
            );
          }}
          title="Load an author's note from the text library. This will append it to the current text, so you can combine multiple items."
        >
          <BiNotepad size="1.5em" />
          Load
        </button>
        <button
          className="btn flex-1"
          onClick={() => {
            dispatch(
              openModal({
                name: "saveToLibrary",
                data: { fileType: "text", content: authornote },
              })
            );
          }}
          title="Save the author's note to the text library."
        >
          <BiNotepad size="1.5em" />
          Save
        </button>
      </div>
      <VarRange
        max={5}
        min={1}
        step={1}
        varName="story_andepth"
        label="Author's Note Depth"
        title="Number of actions from the end of the story to insert Author's Note info."
      />
      <VarInput
        title="Styles the AI will attempt to imitate. Effectiveness depends on model."
        varName="story_genres"
        label="Genres (Comma Separated)"
      />
      <VarTextarea
        varName="story_notes"
        label="Personal Notes (Not Read By AI)"
      />
      <VarToggle
        className="!p-0"
        varName="story_autosave"
        label="Auto Save"
        title="Whether the story is saved after each action."
      />
    </div>
  );
};
