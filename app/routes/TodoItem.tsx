import type { Todo } from "@prisma/client";
import { Form, useFetcher } from "@remix-run/react";
import { useDraggable } from "@dnd-kit/core";
import type { DraggableSyntheticListeners } from "@dnd-kit/core";
import { TrashIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { PriorityBadge } from "./PriorityBadge";
import { useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface TodoItemProps {
	todo: {
		id: string;
		userId: string;
		categoryId: string | null;
		completed: boolean;
		title: string;
		deadline: Date | null;
		priority: "HIGH" | "MEDIUM" | "LOW" | null;
		createdAt: Date;
		updatedAt: Date;
		memo?: string | null;
	};
	isDragging?: boolean;
	isOverlay?: boolean;
	onTodoClick?: (todo: Todo) => void;
}

export function TodoItem({ todo, isOverlay = false, onTodoClick }: TodoItemProps) {
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
		<div className={`bg-white rounded-lg shadow p-4 ${todo.completed ? "opacity-50" : ""}`} onClick={() => !isOverlay && onTodoClick?.(todo as Todo)}>
			<div className="flex flex-col gap-1">
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

					<div className="flex-1 min-w-0">
						<h3 className="text-sm font-medium truncate">{todo.title}</h3>
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

				{todo.deadline && <div className="text-xs text-gray-500">마감일: {format(new Date(todo.deadline), "yyyy년 MM월 dd일", { locale: ko })}</div>}
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
