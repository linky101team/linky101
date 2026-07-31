"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useFloatingRewards } from "@/lib/floatingRewards";

export default function FloatingRewards() {
  const items = useFloatingRewards((s) => s.items);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-1/3 z-[80] flex flex-col items-center gap-1">
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ opacity: 0, y: -56, scale: 1.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className={`text-2xl font-black drop-shadow-lg ${item.color}`}
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
          >
            {item.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
