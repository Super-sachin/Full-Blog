import z from "zod";
export const signupInput = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
});
export const signinInput = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});
export const createBlogInput = z.object({
    title: z.string(),
    content: z.string(),
});
export const updateBlogInput = z.object({
    title: z.string(),
    content: z.string(),
    id: z.string(),
});
//# sourceMappingURL=index.js.map