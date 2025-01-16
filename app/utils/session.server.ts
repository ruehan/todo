import { createCookieSessionStorage, redirect } from "@remix-run/node";

if (!process.env.SESSION_SECRET) {
	throw new Error("SESSION_SECRET must be set");
}

export const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: "__session",
		httpOnly: true,
		path: "/",
		sameSite: "lax",
		secrets: [process.env.SESSION_SECRET],
		secure: process.env.NODE_ENV === "production",
	},
});

export async function getSession(request: Request) {
	const cookie = request.headers.get("Cookie");
	return sessionStorage.getSession(cookie);
}

export async function getUserId(request: Request) {
	const session = await getSession(request);
	const userId = session.get("userId");
	return userId;
}

export async function requireUserId(request: Request, redirectTo: string = new URL(request.url).pathname) {
	const userId = await getUserId(request);
	if (!userId) {
		const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
		throw redirect(`/login?${searchParams}`);
	}
	return userId;
}

export async function createUserSession({ request, userId, remember, redirectTo }: { request: Request; userId: string; remember: boolean; redirectTo: string }) {
	const session = await getSession(request);
	session.set("userId", userId);
	return redirect(redirectTo, {
		headers: {
			"Set-Cookie": await sessionStorage.commitSession(session, {
				maxAge: remember
					? 60 * 60 * 24 * 7 // 7 days
					: undefined,
			}),
		},
	});
}

export async function logout(request: Request) {
	const session = await getSession(request);
	return redirect("/", {
		headers: {
			"Set-Cookie": await sessionStorage.destroySession(session),
		},
	});
}
