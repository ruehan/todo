import { Form, Link } from "@remix-run/react";

export function Navbar() {
	return (
		<nav className="bg-gray-800 p-4">
			<div className="container mx-auto flex justify-between items-center">
				<Link to="/" className="text-white font-bold">
					Todo App
				</Link>
				<Form action="/logout" method="post">
					<button type="submit" className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
						로그아웃
					</button>
				</Form>
			</div>
		</nav>
	);
}
