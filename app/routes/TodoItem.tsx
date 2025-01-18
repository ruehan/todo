import type { Priority, Todo } from "@prisma/client";
import { Form } from "@remix-run/react";
import { useDraggable } from "@dnd-kit/core";
import type { DraggableSyntheticListeners } from "@dnd-kit/core";
import { TrashIcon } from "@heroicons/react/24/outline";
import { PriorityBadge } from "./PriorityBadge";

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

	const itemContent = (
		<div className={`bg-white rounded-lg shadow p-4 ${todo.completed ? "opacity-50" : ""}`}>
			<div className="flex items-center gap-2">
				<div className="flex-1 min-w-0">
					<h3 className="text-sm font-medium truncate">{todo.title}</h3>
				</div>

				{todo.priority && (
					<div className="flex-shrink-0">
						<PriorityBadge priority={todo.priority} />
					</div>
				)}

				{!isOverlay && (
					<Form method="post" className="flex-shrink-0">
						<input type="hidden" name="_action" value="deleteTodo" />
						<input type="hidden" name="todoId" value={todo.id} />
						<button type="submit" className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors">
							<TrashIcon className="w-4 h-4" />
						</button>
					</Form>
				)}
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
