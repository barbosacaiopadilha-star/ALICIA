import { RefObject } from "react";
import { useScroll } from "framer-motion";

export function useSectionProgress(ref: RefObject<HTMLElement>) {
  return useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
}
