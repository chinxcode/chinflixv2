import { memo } from "react";

const Skeleton = memo(({ className }) => {
    return <div className={`animate-pulse bg-gray-800 ${className}`} role="status" aria-label="Loading..." />;
});

Skeleton.displayName = "Skeleton";
export default Skeleton;
