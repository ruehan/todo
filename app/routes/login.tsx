import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useSearchParams, Link } from "@remix-run/react";
import { createUserSession, getUserId } from "../utils/session.server";
import { verifyLogin } from "../utils/user.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await getUserId(request);
	if (userId) return redirect("/");
	return json({});
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const email = formData.get("email");
	const password = formData.get("password");
	const remember = formData.get("remember");
	const redirectTo = formData.get("redirectTo") || "/";

	if (typeof email !== "string" || typeof password !== "string") {
		return json({ errors: { email: "이메일과 비밀번호를 입력해주세요" } }, { status: 400 });
	}

	const user = await verifyLogin(email, password);
	if (!user) {
		return json({ errors: { email: "이메일 또는 비밀번호가 잘못되었습니다" } }, { status: 400 });
	}

	return createUserSession({
		request,
		userId: user.id,
		remember: remember === "on",
		redirectTo: typeof redirectTo === "string" ? redirectTo : "/",
	});
}

export default function Login() {
	const [searchParams] = useSearchParams();
	const actionData = useActionData<typeof action>();

	return (
		<div className="flex min-h-full flex-col justify-center">
			<div className="mx-auto w-full max-w-md px-8">
				<Form method="post" className="space-y-6">
					<div>
						<label className="block text-sm font-medium text-gray-700">이메일</label>
						<input type="email" name="email" className="w-full rounded border px-2 py-1" required />
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">비밀번호</label>
						<input type="password" name="password" className="w-full rounded border px-2 py-1" required />
					</div>

					<input type="hidden" name="redirectTo" value={searchParams.get("redirectTo") ?? undefined} />

					<button type="submit" className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
						로그인
					</button>

					{actionData?.errors?.email && <div className="text-red-500">{actionData.errors.email}</div>}

					<div className="text-center text-sm text-gray-500">
						계정이 없으신가요?{" "}
						<Link className="text-blue-500 underline" to="/signup">
							회원가입
						</Link>
					</div>
				</Form>
			</div>
		</div>
	);
}
