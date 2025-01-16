import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";

import type { Priority } from "@prisma/client";
import { getCategories, createCategory, deleteCategory } from "~/category.server";
import { CategoryManager } from "./CategoryManager";
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

	return (
		<div>
			<CategoryManager categories={categories} />

			<div className="mb-8">
				<h2 className="text-lg font-semibold mb-2">필터</h2>
				<Form method="get" className="flex gap-4">
					<select name="category" className="rounded border px-2 py-1" onChange={(e) => e.form?.submit()}>
						<option value="">모든 카테고리</option>
						{categories.map((category) => (
							<option key={category.id} value={category.id}>
								{category.name}
							</option>
						))}
					</select>

					<select name="priority" className="rounded border px-2 py-1" onChange={(e) => e.form?.submit()}>
						<option value="">모든 우선순위</option>
						<option value="HIGH">높음</option>
						<option value="MEDIUM">중간</option>
						<option value="LOW">낮음</option>
					</select>
				</Form>
			</div>

			<Form method="post" className="mb-8">
				<div className="flex gap-4">
					<input type="text" name="title" placeholder="새로운 할 일" className="flex-1 rounded border px-2 py-1" required />
					<select name="categoryId" className="rounded border px-2 py-1">
						<option value="">카테고리 선택</option>
						{categories.map((category) => (
							<option key={category.id} value={category.id}>
								{category.name}
							</option>
						))}
					</select>
					<select name="priority" className="rounded border px-2 py-1">
						<option value="HIGH">높음</option>
						<option value="MEDIUM">중간</option>
						<option value="LOW">낮음</option>
					</select>
					<input type="date" name="deadline" className="rounded border px-2 py-1" />
					<button type="submit" name="_action" value="create" className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">
						추가
					</button>
				</div>
			</Form>

			<div className="space-y-2">
				{todos.map((todo) => (
					<TodoItem key={todo.id} todo={todo} />
				))}
			</div>
		</div>
	);
}
