import { RootState } from "@/store/store";
import {
  SavedStory,
  closeSidebar,
  openModal,
} from "@/store/uiSlice";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { BiCheck, BiPencil, BiTrash, BiX } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { BsArrowLeftSquareFill } from "react-icons/bs";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";
import { NavMenuItem } from "./NavMenuItem";
import { MenuItem } from "./MenuItem";
import { PiUploadSimpleBold } from "react-icons/pi";

const StoryNameEditor = ({
  story,
  setEditingStory,
}: {
  story: SavedStory;
  setEditingStory: Dispatch<SetStateAction<string | null>>;
}) => {
  const socketApi = useContext(SocketApiContext);
  const inputRef = useRef<HTMLInputElement>(null);
  const [newName, setNewName] = useState(story.name);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <>
      <input
        className="input input-sm bg-base-200 py-0 pl-4 border-0 max-w-none w-full !cursor-text"
        type="text"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        ref={inputRef}
      />

      <button
        className="px-4 py-2"
        onClick={() => {
          setEditingStory(null);
        }}
      >
        <BiX size="1.5em" />
      </button>
      <button
        className="px-4 py-2"
        onClick={() => {
          if (newName.length) {
            socketApi?.renameStory(story.path, newName);
          }
          setEditingStory(null);
        }}
      >
        <BiCheck size="1.5em" />
      </button>
    </>
  );
};

const UploadButton = () => {
  const socketApi = useContext(SocketApiContext);

  return (
    <>
      <input
        type="file"
        className="hidden"
        id="story-upload"
        name="story-upload"
        accept="application/json"
        onChange={(e) => {
          const { files } = e.target;
          if (!files) return;
          for (const file of files) {
            const reader = new FileReader();
            reader.onload = (evt: ProgressEvent<FileReader>) => {
              if (evt?.target?.result) {
                const buffer = evt.target.result as ArrayBuffer;
                socketApi?.uploadFile(file.name, buffer);
              }
            };
            reader.readAsArrayBuffer(file);
          }
        }}
      />
      <label htmlFor="story-upload">
        <MenuItem>
          <PiUploadSimpleBold size="1.5em" />
          Upload Story
        </MenuItem>
      </label>
    </>
  );
};

const LoadStory = () => {
  const { savedStories } = useSelector((state: RootState) => {
    return state.ui.sidebarState;
  });
  const [editingStory, setEditingStory] = useState<string | null>(null);
  const socketApi = useContext(SocketApiContext);
  const dispatch = useDispatch();
  useEffect(() => {
    socketApi?.loadStoryList();
  }, [socketApi]);
  return (
    <>
      <h2 className="px-6 my-3 font-bold text-center">Load Story</h2>
      <ul className="menu menu-md p-0">
        <NavMenuItem subsection={null}>
          <BsArrowLeftSquareFill className="inline" size="1.5em" />
          Main Menu
        </NavMenuItem>
        <UploadButton />
      </ul>
      {!savedStories.length && (
        <div className="text-center mt-6">No stories found.</div>
      )}
      {!!savedStories.length && (
        <ul className="menu menu-md overflow-y-auto flex-nowrap">
          {savedStories.map((story) => {
            return (
              <li
                key={story.path}
                className="flex flex-row w-full h-10 items-center flex-nowrap my-1"
              >
                {editingStory === story.path && (
                  <StoryNameEditor
                    story={story}
                    setEditingStory={setEditingStory}
                  />
                )}
                {editingStory !== story.path && (
                  <>
                    <a
                      onClick={() => {
                        socketApi?.loadStory(story.path);
                        dispatch(closeSidebar());
                      }}
                      title={story.name}
                      className="flex-grow block py-0 h-10 leading-10 content-center whitespace-nowrap overflow-hidden overflow-ellipsis"
                    >
                      {story.name}
                    </a>
                    <button
                      onClick={() => {
                        setEditingStory(story.path);
                      }}
                    >
                      <BiPencil size="1.5em" />
                    </button>
                    <button
                      onClick={() => {
                        dispatch(
                          openModal({ name: "confirmDeleteStory", data: story })
                        );
                      }}
                    >
                      <BiTrash size="1.5em" />
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
};

export default LoadStory;
