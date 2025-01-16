interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto">
			<div className="flex min-h-full items-center justify-center p-4">
				<div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
				<div className="relative bg-white rounded-lg p-6 w-full max-w-md">{children}</div>
			</div>
		</div>
	);
}
