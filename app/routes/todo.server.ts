import { prisma } from "~/db.server";
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

export async function updateTodo({ id, userId, ...data }: { id: string; userId: string; completed?: boolean; title?: string; deadline?: Date; priority?: "HIGH" | "MEDIUM" | "LOW" }) {
	return prisma.todo.update({
		where: { id, userId },
		data,
	});
}

export async function deleteTodo(id: string, userId: string) {
	return prisma.todo.delete({
		where: { id, userId },
	});
}
