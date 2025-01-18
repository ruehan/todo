import { prisma } from "~/utils/db.server";
import type { Priority } from "@prisma/client";

export async function getTodos(
	userId: string,
	filters?: {
		categoryId?: string | null;
		priority?: Priority | null;
	}
) {
	const where = {
		userId,
		...(filters?.categoryId && filters.categoryId !== "" ? { categoryId: filters.categoryId } : {}),
		...(filters?.priority ? { priority: filters.priority } : {}),
	};

	return prisma.todo.findMany({
		where,
		include: {
			category: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	});
}

export async function createTodo({ title, userId, categoryId, deadline, priority = "MEDIUM" }: { title: string; userId: string; categoryId?: string; deadline?: Date; priority?: Priority }) {
	return prisma.todo.create({
		data: {
			title,
			userId,
			categoryId,
			deadline,
			priority,
		},
	});
}

export async function updateTodo({ id, userId, categoryId, ...data }: { id: string; userId: string; categoryId?: string; completed?: boolean; title?: string; deadline?: Date; priority?: Priority }) {
	return prisma.todo.update({
		where: { id, userId },
		data: {
			...data,
			categoryId,
		},
	});
}

export async function deleteTodo({ id, userId }: { id: string; userId: string }) {
	return prisma.todo.delete({
		where: {
			id,
			userId,
		},
	});
}
