import bcrypt from "bcryptjs";
import { prisma } from "~/db.server";

export async function getUserById(id: string) {
	return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: string) {
	return prisma.user.findUnique({ where: { email } });
}

export async function createUser(email: string, password: string) {
	const hashedPassword = await bcrypt.hash(password, 10);
	return prisma.user.create({
		data: {
			email,
			password: hashedPassword,
		},
	});
}

export async function verifyLogin(email: string, password: string) {
	const user = await getUserByEmail(email);
	if (!user) return null;

	const isValid = await bcrypt.compare(password, user.password);
	if (!isValid) return null;

	return user;
}
