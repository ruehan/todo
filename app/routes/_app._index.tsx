import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, useSearchParams, useFetcher } from "@remix-run/react";
import { useState } from "react";
import type { Priority, Todo } from "@prisma/client";
import { getCategories, createCategory, deleteCategory } from "~/utils/category.server";
import { CategoryFolder } from "./CategoryFolder";
import { Modal } from "./Modal";
import { requireUserId } from "../utils/session.server";
import { getTodos, createTodo, updateTodo, deleteTodo } from "../utils/todo.server";
import { TodoItem } from "./TodoItem";
import { DndContext, DragEndEvent, DragStartEvent, pointerWithin } from "@dnd-kit/core";
import { DragOverlay } from "@dnd-kit/core";

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request);
	const url = new URL(request.url);
	const categoryId = url.searchParams.get("category");
	const priority = url.searchParams.get("priority") as Priority | null;

	const [todos, categories] = await Promise.all([getTodos(userId, { categoryId, priority }), getCategories(userId)]);

	return json({ todos, categories });
}

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request);
	const formData = await request.formData();
	const _action = formData.get("_action");

	if (_action === "createCategory") {
		const name = formData.get("categoryName") as string;
		await createCategory(name, userId);
	} else if (_action === "deleteCategory") {
		const categoryId = formData.get("categoryId") as string;
		await deleteCategory(categoryId, userId);
	} else if (_action === "create") {
		const title = formData.get("title") as string;
		const categoryId = formData.get("categoryId") as string;
		const priority = formData.get("priority") as Priority;
		const deadline = formData.get("deadline") ? new Date(formData.get("deadline") as string) : undefined;

		await createTodo({ title, userId, categoryId, priority, deadline });
	} else if (_action === "toggle") {
		const id = formData.get("id") as string;
		const completed = formData.get("completed") === "true";

		await updateTodo({ id, userId, completed: !completed });
	} else if (_action === "delete") {
		const id = formData.get("id") as string;
		await deleteTodo(id, userId);
	} else if (_action === "updateCategory") {
		const todoId = formData.get("todoId") as string;
		const categoryId = formData.get("categoryId") as string;

		// "null" 문자열이 전달되면 실제 null로 변환
		const actualCategoryId = categoryId === "null" ? null : categoryId;

		await updateTodo({
			id: todoId,
			userId,
			categoryId: actualCategoryId as string | undefined,
		});
	}

	return null;
}

export default function Index() {
	const { todos, categories } = useLoaderData<typeof loader>();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
	const fetcher = useFetcher();
	const [activeTodo, setActiveTodo] = useState<Todo | null>(null);

	function handleDragStart(event: DragStartEvent) {
		const draggedTodo = todos.find((t) => t.id === event.active.id);
		if (draggedTodo) {
			const todo = {
				...draggedTodo,
				deadline: draggedTodo.deadline ? new Date(draggedTodo.deadline) : null,
				createdAt: new Date(draggedTodo.createdAt),
				updatedAt: new Date(draggedTodo.updatedAt),
			};
			setActiveTodo(todo);
		}
	}

	function handleDragEnd(event: DragEndEvent) {
		setActiveTodo(null);

		const { active, over } = event;
		const formData = new FormData();
		formData.append("_action", "updateCategory");
		formData.append("todoId", String(active.id));

		if (over) {
			// 폴더에 드롭한 경우
			formData.append("categoryId", String(over.id));
		} else {
			// 폴더 밖으로 드래그한 경우 (카테고리 해제)
			formData.append("categoryId", "null");
		}

		fetcher.submit(formData, { method: "post" });
	}

	// 현재 선택된 카테고리의 할일 목록
	const filteredTodos = selectedCategoryId ? todos.filter((todo) => todo.categoryId === selectedCategoryId) : todos.filter((todo) => !todo.categoryId);

	return (
		<div>
			<DndContext
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
				// collision detection 알고리즘을 pointerWithin으로 변경하여
				// 더 정확한 드롭 감지
				collisionDetection={pointerWithin}
			>
				<div className="mb-8">
					<div className="flex gap-4 mb-4">
						<Form method="post" className="flex-1 flex gap-4">
							<input type="text" name="title" placeholder="새로운 할 일" className="flex-1 rounded border px-2 py-1" required />
							<select name="priority" className="rounded border px-2 py-1">
								<option value="HIGH">높음</option>
								<option value="MEDIUM">중간</option>
								<option value="LOW">낮음</option>
							</select>
							<input type="date" name="deadline" className="rounded border px-2 py-1" />
							<button type="submit" name="_action" value="create" className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">
								할 일 추가
							</button>
						</Form>
						<button onClick={() => setIsModalOpen(true)} className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600">
							폴더 추가
						</button>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
					{/* 뒤로가기 폴더 - 카테고리가 선택되었을 때만 표시 */}
					{selectedCategoryId && (
						<button onClick={() => setSelectedCategoryId(null)} className="block w-full p-4 border rounded-lg hover:bg-gray-50">
							<div className="flex items-center gap-2">
								<svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
								</svg>
								<span className="font-medium">뒤로가기</span>
							</div>
						</button>
					)}

					{/* 카테고리 폴더들 - 카테고리가 선택되지 않았을 때만 표시 */}
					{!selectedCategoryId &&
						categories.map((category) => <CategoryFolder key={category.id} category={category} onSelect={setSelectedCategoryId} isSelected={category.id === selectedCategoryId} />)}

					{/* 할 일들 */}
					{filteredTodos.map((todo) => (
						<div key={todo.id} className="border rounded-lg hover:bg-gray-50 transition-colors">
							<TodoItem
								todo={{
									...todo,
									createdAt: new Date(todo.createdAt),
									updatedAt: new Date(todo.updatedAt),
									deadline: todo.deadline ? new Date(todo.deadline) : null,
								}}
							/>
						</div>
					))}
				</div>
			</DndContext>

			<DragOverlay dropAnimation={null}>
				{activeTodo ? (
					<div className="w-48 opacity-80 shadow-lg rounded-lg bg-white p-4">
						<h3 className="text-sm font-medium truncate">{activeTodo.title}</h3>
					</div>
				) : null}
			</DragOverlay>

			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
				<h2 className="text-lg font-semibold mb-4">새 폴더 만들기</h2>
				<Form method="post" onSubmit={() => setIsModalOpen(false)}>
					<div className="space-y-4">
						<input type="text" name="categoryName" placeholder="폴더 이름" className="w-full rounded border px-2 py-1" required />
						<div className="flex justify-end gap-2">
							<button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-1 rounded border hover:bg-gray-100">
								취소
							</button>
							<button type="submit" name="_action" value="createCategory" className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600">
								만들기
							</button>
						</div>
					</div>
				</Form>
			</Modal>
		</div>
	);
}
