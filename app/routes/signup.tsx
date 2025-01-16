import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, Link } from "@remix-run/react";
import { createUserSession, getUserId } from "../utils/session.server";
import { getUserByEmail, createUser } from "../utils/user.server";

type ActionErrors = {
	email?: string;
	password?: string;
	confirmPassword?: string;
};

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await getUserId(request);
	if (userId) return redirect("/");
	return json({});
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const email = formData.get("email");
	const password = formData.get("password");
	const confirmPassword = formData.get("confirmPassword");

	if (typeof email !== "string" || typeof password !== "string" || typeof confirmPassword !== "string") {
		return json<{ errors: ActionErrors }>(
			{
				errors: { email: "모든 필드를 입력해주세요" },
			},
			{ status: 400 }
		);
	}

	if (password.length < 8) {
		return json<{ errors: ActionErrors }>(
			{
				errors: { password: "비밀번호는 최소 8자 이상이어야 합니다" },
			},
			{ status: 400 }
		);
	}

	if (password !== confirmPassword) {
		return json<{ errors: ActionErrors }>(
			{
				errors: { confirmPassword: "비밀번호가 일치하지 않습니다" },
			},
			{ status: 400 }
		);
	}

	const existingUser = await getUserByEmail(email);
	if (existingUser) {
		return json<{ errors: ActionErrors }>(
			{
				errors: { email: "이미 사용 중인 이메일입니다" },
			},
			{ status: 400 }
		);
	}

	const user = await createUser(email, password);
	return createUserSession({
		request,
		userId: user.id,
		remember: false,
		redirectTo: "/",
	});
}

export default function SignUp() {
	const actionData = useActionData<typeof action>();

	return (
		<div className="flex min-h-full flex-col justify-center">
			<div className="mx-auto w-full max-w-md px-8">
				<Form method="post" className="space-y-6">
					<div>
						<label className="block text-sm font-medium text-gray-700">이메일</label>
						<input type="email" name="email" className="w-full rounded border px-2 py-1" required />
						{actionData?.errors?.email && <div className="pt-1 text-red-700">{actionData.errors.email}</div>}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">비밀번호</label>
						<input type="password" name="password" className="w-full rounded border px-2 py-1" required />
						{actionData?.errors?.password && <div className="pt-1 text-red-700">{actionData.errors.password}</div>}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">비밀번호 확인</label>
						<input type="password" name="confirmPassword" className="w-full rounded border px-2 py-1" required />
						{actionData?.errors?.confirmPassword && <div className="pt-1 text-red-700">{actionData.errors.confirmPassword}</div>}
					</div>

					<button type="submit" className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
						회원가입
					</button>

					<div className="text-center text-sm text-gray-500">
						이미 계정이 있으신가요?{" "}
						<Link className="text-blue-500 underline" to="/login">
							로그인
						</Link>
					</div>
				</Form>
			</div>
		</div>
	);
}
