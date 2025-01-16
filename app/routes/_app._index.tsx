import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import type { Priority } from "@prisma/client";
import { getCategories, createCategory, deleteCategory } from "~/category.server";
import { CategoryFolder } from "./CategoryFolder";
import { Modal } from "./Modal";
import { requireUserId } from "./session.server";
import { getTodos, createTodo, updateTodo, deleteTodo } from "./todo.server";
import { TodoItem } from "./TodoItem";

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
	}

	return null;
}

export default function Index() {
	const { todos, categories } = useLoaderData<typeof loader>();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const uncategorizedTodos = todos.filter((todo) => !todo.categoryId);

	return (
		<div>
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

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{categories.map((category) => (
					<CategoryFolder key={category.id} category={category} />
				))}

				{uncategorizedTodos.map((todo) => (
					<div key={todo.id} className="border rounded-lg p-4 hover:bg-gray-50">
						<TodoItem todo={todo} />
					</div>
				))}
			</div>

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
