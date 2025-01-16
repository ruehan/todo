import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { requireUserId } from "./session.server";
import { getTodos, createTodo, updateTodo, deleteTodo } from "./todo.server";
import { TodoItem } from "./TodoItem";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const userId = await requireUserId(request);
	const todos = await getTodos(userId);
	return json({ todos });
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const userId = await requireUserId(request);
	const formData = await request.formData();
	const _action = formData.get("_action");

	if (_action === "create") {
		const title = formData.get("title") as string;
		const priority = formData.get("priority") as "HIGH" | "MEDIUM" | "LOW";
		const deadline = formData.get("deadline") ? new Date(formData.get("deadline") as string) : undefined;

		await createTodo({ title, userId, priority, deadline });
	} else if (_action === "toggle") {
		const id = formData.get("id") as string;
		const completed = formData.get("completed") === "true";

		await updateTodo({ id, userId, completed: !completed });
	} else if (_action === "delete") {
		const id = formData.get("id") as string;
		await deleteTodo(id, userId);
	}

	return null;
};

export default function Index() {
	const { todos } = useLoaderData<typeof loader>();

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">할 일 목록</h1>

			<Form method="post" className="mb-8">
				<div className="flex gap-4">
					<input type="text" name="title" placeholder="새로운 할 일" className="flex-1 rounded-lg border p-2" required />
					<select name="priority" className="rounded-lg border p-2">
						<option value="HIGH">높음</option>
						<option value="MEDIUM">중간</option>
						<option value="LOW">낮음</option>
					</select>
					<input type="date" name="deadline" className="rounded-lg border p-2" />
					<button type="submit" name="_action" value="create" className="bg-blue-500 text-white px-4 py-2 rounded-lg">
						추가
					</button>
				</div>
			</Form>

			<div className="space-y-2">
				{todos.map((todo) => (
					<TodoItem
						key={todo.id}
						todo={{
							id: todo.id,
							title: todo.title,
							completed: todo.completed,
							priority: todo.priority,
							deadline: todo.deadline ? new Date(todo.deadline) : undefined,
							category: todo.category ? { name: todo.category.name } : null,
						}}
					/>
				))}
			</div>
		</div>
	);
}
