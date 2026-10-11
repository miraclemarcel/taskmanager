"use client";

import { useUiStore } from "@/store";
import { Icon } from "./icon";
import { Avatar } from "./top-bar";

type PageIntroProps = {
  title: string;
  description: string;
};

export function PageIntro({ title, description }: PageIntroProps) {
  const openAdd = useUiStore((state) => state.openAdd);

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
      <div className="min-w-0">
        <p className="text-xs font-extrabold uppercase tracking-[1.2px] text-navy">
          Personal workspace
        </p>
        <h1 className="pt-2 text-[30px] leading-9 font-extrabold tracking-[-0.75px] text-ink">
          {title}
        </h1>
        <p className="pt-2 text-sm leading-6 text-muted">{description}</p>
      </div>

      <div className="flex items-center gap-4 lg:pt-1">
        <button
          type="button"
          onClick={openAdd}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-field bg-navy px-4 text-sm font-bold text-white shadow-raise transition-opacity hover:opacity-90 lg:w-auto"
        >
          <Icon name="plus" size={18} />
          Add Task
        </button>
        <span className="hidden lg:block">
          <Avatar />
        </span>
      </div>
    </div>
  );
}
