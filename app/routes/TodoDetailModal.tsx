import { Dialog } from "@headlessui/react";
import { Form, useFetcher } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { Todo } from "@prisma/client";

interface TodoDetailModalProps {
	todo: Todo;
	isOpen: boolean;
	onClose: () => void;
}

export function TodoDetailModal({ todo, isOpen, onClose }: TodoDetailModalProps) {
	const fetcher = useFetcher();
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		if (isOpen && textareaRef.current) {
			textareaRef.current.value = todo.memo || "";
		}
	}, [isOpen, todo.memo]);

	const handleSave = () => {
		const memo = textareaRef.current?.value || "";
		fetcher.submit(
			{
				_action: "updateTodoMemo",
				todoId: todo.id,
				memo,
			},
			{ method: "post" }
		);
		onClose();
	};

	return (
		<Dialog open={isOpen} onClose={onClose} className="relative z-50">
			<div className="fixed inset-0 bg-black/30" aria-hidden="true" />

			<div className="fixed inset-0 flex items-center justify-center p-4">
				<Dialog.Panel className="w-full max-w-2xl bg-white rounded-lg shadow-xl">
					<div className="flex items-center justify-between p-4 border-b">
						<Dialog.Title className="text-lg font-semibold">{todo.title}</Dialog.Title>
						<button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
							<XMarkIcon className="w-5 h-5" />
						</button>
					</div>

					<div className="p-4">
						<div className="mb-4">
							<label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
							<textarea
								ref={textareaRef}
								className="w-full h-48 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="메모를 입력하세요..."
								defaultValue={todo.memo || ""}
							/>
						</div>

						<div className="flex justify-end gap-2">
							<button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
								취소
							</button>
							<button type="button" onClick={handleSave} className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600">
								저장
							</button>
						</div>
					</div>
				</Dialog.Panel>
			</div>
		</Dialog>
	);
}
