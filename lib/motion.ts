import { Variants } from "framer-motion";

export const calmEase = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: calmEase },
  },
};

export const fadeOnly: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1, ease: calmEase } },
};

export const staggerChildren = (stagger = 0.12): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger },
  },
});
