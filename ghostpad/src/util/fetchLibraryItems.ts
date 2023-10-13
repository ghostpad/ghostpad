import { LibraryItem } from "@/components/modals/LoadFromLibraryModal";
import { getLibraryList } from "@/ghostpadApi/getLibraryList";
import { store } from "@/store/store";
import { updateLibraryItems } from "@/store/uiSlice";

export const fetchLibraryItems = async (fileType: string | undefined) => {
  if (!fileType) {
    return;
  }
  const listRes = await getLibraryList(fileType);
  const list: LibraryItem[] = await listRes.json();
  store.dispatch(updateLibraryItems(list));
};
