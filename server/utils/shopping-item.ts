import { z } from "zod";

export const shoppingItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.string().min(1),
  checked: z.boolean().default(false),
  allocations: z.array(z.object({ planId: z.string(), amount: z.number().positive() })).optional(),
  source: z
    .object({
      planId: z.string(),
      recipes: z.array(z.object({ id: z.string(), title: z.string() })),
    })
    .optional(),
});
