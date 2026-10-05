import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import { PrismaClient } from "../generated/prisma/client";
import { withAccelerate } from '@prisma/extension-accelerate';
import { createBlogInput } from "@sachinkarki/cohort-common";
export const blogRouter = new Hono();
blogRouter.use("/*", async (c, next) => {
    const header = c.req.header("Authorization");
    if (!header || !header.startsWith("Bearer ")) {
        return c.json({ error: "Unauthorized" }, 401);
    }
    const token = header.slice(7);
    try {
        const response = await verify(token, c.env.JWT_SECRET, "HS256");
        if (typeof response.id !== "string") {
            return c.json({ error: "Invalid token payload" }, 401);
        }
        c.set("userId", response.id);
        await next();
        return;
    }
    catch (e) {
        return c.json({ error: "Invalid or expired token" }, 401);
    }
});
blogRouter.post("/", async (c) => {
    try {
        const body = await c.req.json();
        console.log("BODY:", body);
        const { success } = createBlogInput.safeParse(body);
        if (!success) {
            return c.json({ error: "Invalid input" }, 400);
        }
        const userId = c.get("userId");
        console.log("USER ID:", userId);
        const prisma = new PrismaClient({
            accelerateUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());
        console.log("Creating post...");
        const blog = await prisma.post.create({
            data: {
                title: body.title,
                content: body.content,
                authorId: userId,
            },
        });
        console.log("BLOG CREATED:", blog.id);
        return c.json({
            id: blog.id,
        });
    }
    catch (error) {
        console.error("CREATE BLOG ERROR:", error);
        return c.json({
            error: String(error),
        }, 500);
    }
});
blogRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
        accelerateUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const blogs = await prisma.post.findMany({
        select: {
            content: true,
            title: true,
            id: true,
            author: {
                select: {
                    name: true,
                }
            }
        }
    });
    console.log(JSON.stringify(blogs, null, 2));
    return c.json({
        blogs
    });
});
blogRouter.get("/:id", async (c) => {
    const id = c.req.param("id");
    const prisma = new PrismaClient({
        accelerateUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    try {
        const blog = await prisma.post.findFirst({
            where: {
                id: id,
            },
            select: {
                content: true,
                title: true,
                id: true,
                author: {
                    select: {
                        name: true,
                    }
                }
            }
        });
        if (!blog) {
            return c.json({ message: "Blog not found" }, 404);
        }
        return c.json({ blog }, 200);
    }
    catch (e) {
        console.error(e);
        return c.json({ message: "Error while fetching blog" }, 500);
    }
});
