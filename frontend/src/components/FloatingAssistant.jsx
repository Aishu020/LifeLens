import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function FloatingAssistant() {
  const navigate = useNavigate();
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate("/assistant")}
      className="fixed bottom-24 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-glow"
    >
      AI
    </motion.button>
  );
}

