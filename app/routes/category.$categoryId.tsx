import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getCategories } from "~/utils/category.server";
import { requireUserId } from "../utils/session.server";
import { getTodos } from "../utils/todo.server";
import { TodoItem } from "./TodoItem";

export async function loader({ request, params }: LoaderFunctionArgs) {
	const userId = await requireUserId(request);
	const categoryId = params.categoryId;

	if (!categoryId) {
		throw new Error("Category ID is required");
	}

	const [todos, categories] = await Promise.all([getTodos(userId, { categoryId }), getCategories(userId)]);

	const currentCategory = categories.find((c) => c.id === categoryId);

	if (!currentCategory) {
		throw new Error("Category not found");
	}

	return json({ todos, currentCategory });
}

export default function CategoryDetail() {
	const { todos, currentCategory } = useLoaderData<typeof loader>();

	return (
		<div>
			<div className="mb-6 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Link to="/" className="text-blue-500 hover:underline">
						← 돌아가기
					</Link>
					<h1 className="text-2xl font-bold">{currentCategory.name}</h1>
					<span className="text-gray-500">({todos.length})</span>
				</div>
			</div>

			<div className="space-y-2">
				{todos.map((todo) => (
					<TodoItem key={todo.id} todo={todo} />
				))}
			</div>
		</div>
	);
}
