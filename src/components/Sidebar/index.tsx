import { closeSidebar, updateSelectedSection } from "@/store/uiSlice";
import { AiFillHome, AiFillSetting } from "react-icons/ai";
import { BiNotepad, BiSliderAlt } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Home from "./Home";
import ModelSettings from "./ModelSettings";
import Settings from "./Settings";
import { WorldInfo } from "./WorldInfo";
import { Memory } from "./Memory";
import { KoboldConfig } from "@/types/KoboldConfig";
import { BsPersonVcard } from "react-icons/bs";
import { SidebarSection } from "@/types/SidebarSection";
import { SectionButton } from "./SectionButton";
import { SocketState } from "@/store/connectionSlice";
import cx from "classix";

const screenComponents: Partial<Record<SidebarSection, () => JSX.Element>> = {
  [SidebarSection.Home]: Home,
  [SidebarSection.ModelSettings]: ModelSettings,
  [SidebarSection.Settings]: Settings,
  [SidebarSection.WorldInfo]: WorldInfo,
  [SidebarSection.Memory]: Memory,
};

const Sidebar = () => {
  const [koboldConfig, selectedSection, socketState] = useSelector((state: RootState) => {
    return [state.config.koboldConfig, state.ui.sidebarState.selectedSection, state.connection.socketState];
  }) as [KoboldConfig, SidebarSection, SocketState];
  const SectionComponent = Object.keys(screenComponents).includes(
    selectedSection
  )
    ? screenComponents[selectedSection]
    : null;
  const dispatch = useDispatch();

  return (
    <div className="drawer-side">
      <label
        className="drawer-overlay"
        onClick={() => {
          dispatch(closeSidebar());
          dispatch(updateSelectedSection(SidebarSection.Home));
        }}
      ></label>
      <div className="w-[88%] min-h-full h-full bg-base-100 text-base-content flex flex-col max-w-md">
        <div className="text-center py-3">
          <span className={cx("inline-block rounded w-2 h-2 mx-2",
            socketState === SocketState.CONNECTED && "bg-success",
            socketState === SocketState.DISCONNECTED && "bg-error",
            socketState === SocketState.READY_TO_CONNECT && "bg-warning")} />
          {socketState === SocketState.CONNECTED ? koboldConfig.model?.model : "[Not Connected]"}</div>
        <div className="px-4 drawer-subnav text-center py-2 border-y border-neutral flex flex-wrap">
          <SectionButton section={SidebarSection.Home} Icon={AiFillHome} />
          <SectionButton
            section={SidebarSection.ModelSettings}
            Icon={BiSliderAlt}
          />
          <SectionButton
            section={SidebarSection.WorldInfo}
            Icon={BsPersonVcard}
          />
          <SectionButton section={SidebarSection.Memory} Icon={BiNotepad} />
          <SectionButton
            section={SidebarSection.Settings}
            Icon={AiFillSetting}
          />
        </div>
        {SectionComponent && (
          <div className="overflow-y-auto flex flex-col flex-grow">
            <SectionComponent />
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
