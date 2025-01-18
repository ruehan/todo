import type { Priority, Todo } from "@prisma/client";
import { Form } from "@remix-run/react";
import { useDraggable } from "@dnd-kit/core";
import type { DraggableSyntheticListeners } from "@dnd-kit/core";

interface TodoItemProps {
	todo: Todo;
	isDragging?: boolean;
	isOverlay?: boolean;
}

export function TodoItem({ todo, isOverlay = false }: TodoItemProps) {
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
		id: todo.id,
		data: todo,
	});

	const style =
		!isOverlay && transform
			? {
					transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
					touchAction: "none",
			  }
			: undefined;

	const getPriorityIcon = (priority: Priority) => {
		switch (priority) {
			case "HIGH":
				return (
					<svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
					</svg>
				);
			case "MEDIUM":
				return (
					<svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
					</svg>
				);
			case "LOW":
				return (
					<svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
					</svg>
				);
		}
	};

	const itemContent = (
		<div className={`bg-white rounded-lg shadow p-4 ${todo.completed ? "opacity-50" : ""}`}>
			<div className="flex items-center gap-4">
				<div className="flex-1 min-w-0">
					<h3 className="text-sm font-medium truncate">{todo.title}</h3>
				</div>
			</div>
		</div>
	);

	if (isOverlay) {
		return itemContent;
	}

	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`group relative h-full cursor-move transition-opacity ${isDragging ? "opacity-50" : ""}`}>
			{itemContent}
		</div>
	);
}
