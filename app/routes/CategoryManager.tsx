import { Form } from "@remix-run/react";

interface Category {
	id: string;
	name: string;
	_count: { todos: number };
}

interface CategoryManagerProps {
	categories: Category[];
}

export function CategoryManager({ categories }: CategoryManagerProps) {
	return (
		<div className="mb-6">
			<h2 className="text-lg font-semibold mb-2">카테고리 관리</h2>

			<Form method="post" className="flex gap-2 mb-4">
				<input type="text" name="categoryName" placeholder="새 카테고리" className="flex-1 rounded border px-2 py-1" required />
				<button type="submit" name="_action" value="createCategory" className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600">
					추가
				</button>
			</Form>

			<div className="space-y-2">
				{categories.map((category) => (
					<div key={category.id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
						<span>
							{category.name} ({category._count.todos})
						</span>
						<Form method="post" className="inline">
							<input type="hidden" name="categoryId" value={category.id} />
							<button type="submit" name="_action" value="deleteCategory" className="text-red-500 hover:text-red-700">
								삭제
							</button>
						</Form>
					</div>
				))}
			</div>
		</div>
	);
}
