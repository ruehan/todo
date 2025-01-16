import { Link } from "@remix-run/react";

interface CategoryFolderProps {
	category: {
		id: string;
		name: string;
		_count: {
			todos: number;
		};
	};
}

export function CategoryFolder({ category }: CategoryFolderProps) {
	return (
		<Link to={`/category/${category.id}`} className="block p-4 border rounded-lg hover:bg-gray-50">
			<div className="flex items-center gap-2">
				<svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
				</svg>
				<span className="font-medium">{category.name}</span>
				<span className="text-sm text-gray-500">({category._count.todos})</span>
			</div>
		</Link>
	);
}
