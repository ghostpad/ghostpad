import { HomeSubsection } from "@/types/HomeSection";
import { LoadModelSubsection } from "@/types/LoadModelSubsection";
import { PropsWithChildren } from "react";
import { useDispatch } from "react-redux";
import { MenuItem } from "./MenuItem";
import { updateSelectedSubsection } from "@/store/uiSlice";

export const NavMenuItem = ({
  subsection,
  children,
}: PropsWithChildren<{
  subsection: HomeSubsection | LoadModelSubsection | null;
}>) => {
  const dispatch = useDispatch();
  return (
    <MenuItem onClick={() => dispatch(updateSelectedSubsection(subsection))}>
      {children}
    </MenuItem>
  );
};
