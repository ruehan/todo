import type { Priority, Todo } from "@prisma/client";
import { Form, useFetcher } from "@remix-run/react";
import { useDraggable } from "@dnd-kit/core";
import type { DraggableSyntheticListeners } from "@dnd-kit/core";
import { TrashIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { PriorityBadge } from "./PriorityBadge";
import { useState } from "react";

interface TodoItemProps {
	todo: Todo;
	isDragging?: boolean;
	isOverlay?: boolean;
}

export function TodoItem({ todo, isOverlay = false }: TodoItemProps) {
	const fetcher = useFetcher();
	const [isDragStarted, setIsDragStarted] = useState(false);
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

	const handleDragStart = (e: React.PointerEvent) => {
		setIsDragStarted(true);
		listeners?.onPointerDown?.(e);
	};

	const handleDragEnd = (e: React.PointerEvent) => {
		setIsDragStarted(false);
		listeners?.onPointerUp?.(e);
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.preventDefault();
		if (window.confirm("이 할일을 삭제하시겠습니까?")) {
			fetcher.submit({ _action: "deleteTodo", todoId: todo.id }, { method: "post" });
		}
	};

	const itemContent = (
		<div className={`bg-white rounded-lg shadow p-4 ${todo.completed ? "opacity-50" : ""}`}>
			<div className="flex items-center gap-2">
				<div
					className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600"
					{...attributes}
					onPointerDown={handleDragStart}
					onPointerUp={handleDragEnd}
					onClick={(e) => {
						if (!isDragStarted) {
							e.preventDefault();
						}
					}}
				>
					<Bars3Icon className="w-5 h-5" />
				</div>

				<div className="flex-1 min-w-0 group/title relative">
					<h3 className="text-sm font-medium truncate" title={todo.title}>
						{todo.title}
					</h3>

					<div className="absolute left-0 -top-8 transform opacity-0 invisible group-hover/title:opacity-100 group-hover/title:visible transition-all duration-200 z-10 w-max max-w-screen-sm">
						<div className="bg-gray-900 text-white px-3 py-1.5 rounded text-sm whitespace-nowrap shadow-lg">{todo.title}</div>
						<div className="absolute -bottom-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
					</div>
				</div>

				{todo.priority && (
					<div className="flex-shrink-0">
						<PriorityBadge priority={todo.priority} />
					</div>
				)}

				{!isOverlay && (
					<button
						onClick={handleDelete}
						className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 
								 rounded-full hover:bg-gray-100 transition-colors"
						title="할일 삭제"
					>
						<TrashIcon className="w-4 h-4" />
					</button>
				)}
			</div>
		</div>
	);

	if (isOverlay) {
		return itemContent;
	}

	return (
		<div ref={setNodeRef} style={style} className={`group relative h-full transition-opacity ${isDragging ? "opacity-50" : ""}`}>
			{itemContent}
		</div>
	);
}
