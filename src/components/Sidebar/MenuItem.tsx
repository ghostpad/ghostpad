import cx from "classix";
import { PropsWithChildren } from "react";

export const MenuItem = ({
  children,
  onClick,
  className = "",
  innerClassName = ""
}: PropsWithChildren<{
  onClick?: () => void;
  className?: string;
  innerClassName?: string;
}>) => {
  return (
    <li className={className}>
      <a className={cx("px-6 py-3", innerClassName)} onClick={onClick}>
        {children}
      </a>
    </li>
  );
};