import { prisma } from "~/db.server";

export async function getCategories(userId: string) {
	return prisma.category.findMany({
		where: { userId },
		include: {
			_count: {
				select: { todos: true },
			},
		},
	});
}

export async function createCategory(name: string, userId: string) {
	return prisma.category.create({
		data: { name, userId },
	});
}

export async function deleteCategory(id: string, userId: string) {
	return prisma.category.delete({
		where: { id, userId },
	});
}
