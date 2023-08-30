import { RootState } from "@/store/store";
import { updateSelectedSection } from "@/store/uiSlice";
import { SidebarSection } from "@/types/SidebarSection";
import { IconType } from "react-icons";
import { useDispatch, useSelector } from "react-redux";

export const SectionButton = ({
  section,
  Icon
}: {
  section: SidebarSection;
  Icon: IconType;
}) => {
  const selectedSection = useSelector((state: RootState) => {
    return state.ui.sidebarState.selectedSection;
  });
  const dispatch = useDispatch();
  return (
    <button
      className={`btn btn-ghost btn-sm rounded-btn px-0 flex-grow ${
        section === selectedSection ? "text-secondary" : ""
      }`}
      onClick={() => dispatch(updateSelectedSection(section))}
    >
      <Icon size="2em" />
    </button>
  );
};
