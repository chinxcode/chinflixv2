import { motion } from "framer-motion";

const PageTransition = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
                duration: 0.2,
                ease: "easeInOut",
            }}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
