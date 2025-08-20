"use client";

import { useEffect } from "react";
import { useMediaQuery } from "usehooks-ts";
import { cn } from "@/lib/utils";
import { useCreatorSidebar } from "@/store/use-creator-sidebar";

interface ContainerProps {
    children: React.ReactNode;
};

export const Container = ({
    children,
}: ContainerProps) => {
    const {
        collapsed,
        onCollapse,
        onExpand,
    } = useCreatorSidebar((state) => state);
    const matches = useMediaQuery(`(max-width: 1024px)`);

    useEffect(() => {
        if (matches) {
            onCollapse();
        } else {
            onExpand();
        }
    }, [matches, onCollapse, onExpand]);


    return (
        <div
        className={cn(
            "flex-1 min-h-screen p-6 overflow-y-auto transition-all",
            collapsed ? "ml-[70px]" : "ml-[250px]" // match sidebar width!
        )}
        >
        {children}
        </div>
    )
}