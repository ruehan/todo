import { Outlet } from "@remix-run/react";
import { Navbar } from "./Navbar";

export default function AppLayout() {
	return (
		<div>
			<Navbar />
			<main className="container mx-auto p-4">
				<Outlet />
			</main>
		</div>
	);
}
