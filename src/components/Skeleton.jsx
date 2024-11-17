import { memo } from "react";

const Skeleton = memo(({ className, withLoader = false }) => {
    return (
        <div className={`relative ${withLoader ? "bg-black/90" : "bg-gray-800"} ${className}`} role="status" aria-label="Loading...">
            {withLoader && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                </div>
            )}
        </div>
    );
});

Skeleton.displayName = "Skeleton";
export default Skeleton;
