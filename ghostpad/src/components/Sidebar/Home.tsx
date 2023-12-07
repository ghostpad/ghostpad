import { openModal } from "@/store/uiSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useContext, useState } from "react";
import cx from "classix";
import LoadModel from "./LoadModel";
import LoadStory from "./LoadStory";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";
import { HomeSubsection } from "@/types/HomeSection";
import { VarInput } from "../Forms/VarInput";
import { MenuItem } from "./MenuItem";
import { NavMenuItem } from "./NavMenuItem";

const Home = () => {
  const selectedSubsection = useSelector(
    (state: RootState) => state.ui.sidebarState.selectedSubsection
  );
  const firstSelectedSubsection =
    selectedSubsection?.split(".").slice(0, 2).join(".") || null;
  return (
    <>
      {firstSelectedSubsection === null && <MainMenu />}
      {firstSelectedSubsection === HomeSubsection.LoadModel && <LoadModel />}
      {firstSelectedSubsection === HomeSubsection.LoadStory && <LoadStory />}
    </>
  );
};

const MainMenu = () => {
  const dispatch = useDispatch();
  const koboldConfig = useSelector((state: RootState) => {
    return state.config.koboldConfig;
  });

  const socketApi = useContext(SocketApiContext);
  const storyModes = ["Story", "Adventure", "Chat"];
  const [modeChangePending, setModeChangePending] = useState(false);

  const handleModeChange = () => {
    if (modeChangePending) return;
    setModeChangePending(true);
    if (typeof koboldConfig.story?.storymode !== "number") return;
    const nextMode = (koboldConfig.story?.storymode + 1) % 3;
    socketApi?.varChangeWithCallback("story_storymode", nextMode, () => {
      // In adventure mode in Kobold, you can choose between story or adventure style input
      // I don't want to have modes within modes, so adventure mode will always be adventure style input
      if (nextMode === 1) {
        socketApi?.varChangeWithCallback("story_actionmode", 1, () => {
          setModeChangePending(false);
        });
      } else {
        setModeChangePending(false);
      }
    });
  };

  const tokensInUse = koboldConfig.story?.context.reduce(
    (acc, ctxItem) => acc + ctxItem.tokens.length,
    0
  );

  return (
    <>
      <h2 className="px-6 py-3 font-bold text-center">Main Menu</h2>
      <ul className="menu menu-md p-0">
        <NavMenuItem subsection={HomeSubsection.LoadModel}>
          Load Model
        </NavMenuItem>
        <NavMenuItem subsection={HomeSubsection.LoadStory}>
          Load Story
        </NavMenuItem>
        <MenuItem onClick={() => dispatch(openModal({ name: "saveStory" }))}>
          Save Story
        </MenuItem>
        <MenuItem
          className={cx(modeChangePending && "disabled")}
          onClick={handleModeChange}
        >
          Mode: {storyModes[koboldConfig.story?.storymode ?? 0]}
        </MenuItem>
      </ul>
      {koboldConfig.story?.storymode === 2 && (
        <div className="p-6">
          <VarInput varName="story_chatname" label="User Name" syncOnBlur />
          <VarInput varName="story_botname" label="Bot Name" syncOnBlur />
        </div>
      )}

      {!koboldConfig.system?.noai && (
        <div className="px-6">
          <progress
            className="progress progress-primary w-full"
            value={tokensInUse}
            max={koboldConfig.model?.max_length}
          />
          <span className="text-sm">
            {tokensInUse} / {koboldConfig.model?.max_length} Tokens In Use
          </span>
        </div>
      )}
    </>
  );
};

export default Home;
