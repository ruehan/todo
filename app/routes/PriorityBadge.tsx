import type { Priority } from "@prisma/client";

const PRIORITY_COLORS = {
	LOW: "bg-blue-100 text-blue-800",
	MEDIUM: "bg-yellow-100 text-yellow-800",
	HIGH: "bg-red-100 text-red-800",
};

const PRIORITY_LABELS = {
	LOW: "낮음",
	MEDIUM: "중간",
	HIGH: "높음",
};

interface PriorityBadgeProps {
	priority: Priority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
	return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[priority]}`}>{PRIORITY_LABELS[priority]}</span>;
}
