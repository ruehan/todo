import type { Category, Priority } from "@prisma/client";
import { Form } from "@remix-run/react";

interface TodoItemProps {
	todo: {
		id: string;
		title: string;
		completed: boolean;
		priority: Priority;
		deadline: string | null; // Date를 string으로 변경
		createdAt: string; // Date를 string으로 변경
		updatedAt: string; // Date를 string으로 변경
		categoryId: string | null;
		userId: string;
		category: {
			id: string;
			name: string;
			userId: string;
		} | null;
	};
}

export function TodoItem({ todo }: TodoItemProps) {
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

	return (
		<div className="group relative h-full">
			{/* 우선순위 아이콘 - 왼쪽 상단 */}
			<div className="absolute top-2 left-2">{getPriorityIcon(todo.priority)}</div>

			{/* 삭제 버튼 - 오른쪽 상단 */}
			<Form method="post" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
				<input type="hidden" name="id" value={todo.id} />
				<button type="submit" name="_action" value="delete" className="text-gray-400 hover:text-red-500">
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</Form>

			{/* 메인 콘텐츠 */}
			<div className="pt-10 pb-4 px-4">
				<Form method="post" className="space-y-2">
					<input type="hidden" name="id" value={todo.id} />
					<div className="flex items-center gap-3">
						<input type="checkbox" name="completed" checked={todo.completed} onChange={(e) => e.target.form?.submit()} className="h-5 w-5 rounded border-gray-300" />
						<span className={`flex-1 ${todo.completed ? "line-through text-gray-500" : ""}`}>{todo.title}</span>
					</div>
				</Form>

				{/* 마감일 - 하단 */}
				{todo.deadline && (
					<div className="mt-2 flex items-center text-sm text-gray-500">
						<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
						{new Date(todo.deadline).toLocaleDateString()}
					</div>
				)}
			</div>
		</div>
	);
}
