import { RootState } from "@/store/store";
import { useEffect, useState } from "react";
import { BiX } from "react-icons/bi";
import { useSelector } from "react-redux";

export const StoryCommentaryBox = () => {
  const [showCommentary, setShowCommentary] = useState(false);
  const storyCommentary = useSelector(
    (state: RootState) => state.worldInfo.storyCommentary
  );

  useEffect(() => {
    if (storyCommentary) {
      setShowCommentary(true);
    }
  }, [storyCommentary]);

  if (!storyCommentary || !showCommentary) {
    return null;
  }

  return (
    <div className="commentary-box p-4 flex">
      <div className="mr-4">
        {storyCommentary.who}: {storyCommentary.review}
      </div>
      <button
        className="btn btn-neutral"
        onClick={() => {
          setShowCommentary(false);
        }}
      >
        <BiX size="1.5em" />
      </button>
    </div>
  );
};
