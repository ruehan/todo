import { useDroppable } from "@dnd-kit/core";

interface CategoryFolderProps {
	category: {
		id: string;
		name: string;
		_count: {
			todos: number;
		};
	};
	onSelect: (categoryId: string) => void;
	isSelected: boolean;
}

export function CategoryFolder({ category, onSelect, isSelected }: CategoryFolderProps) {
	const { setNodeRef } = useDroppable({
		id: category.id,
		data: category,
	});

	return (
		<div ref={setNodeRef} className="relative">
			<button onClick={() => onSelect(category.id)} className={`block w-full p-4 border rounded-lg transition-colors ${isSelected ? "bg-blue-50 border-blue-500" : "hover:bg-gray-50"}`}>
				<div className="flex items-center gap-2">
					<svg className={`w-6 h-6 ${isSelected ? "text-blue-500" : "text-yellow-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
					</svg>
					<span className="font-medium">{category.name}</span>
					<span className="text-sm text-gray-500">({category._count.todos})</span>
				</div>
			</button>
		</div>
	);
}
