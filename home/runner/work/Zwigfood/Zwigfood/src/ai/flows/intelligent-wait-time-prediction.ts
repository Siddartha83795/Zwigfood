
'use server';

/**
 * @fileOverview An intelligent wait time prediction AI agent.
 *
 * - predictWaitTime - A function that predicts the wait time for an order.
 * - PredictWaitTimeInput - The input type for the predictWaitTime function.
 * - PredictWaitTimeOutput - The return type for the predictWaitTime function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/client-provider';

const PredictWaitTimeInputSchema = z.object({
  outletId: z.string().describe('The ID of the outlet the order is being placed at.'),
  itemIds: z.array(z.string()).describe('The IDs of the items in the order.'),
  orderTime: z.string().describe('The time the order is being placed, in ISO format.'),
  queueDepth: z.number().describe('The current number of orders in the queue.'),
});
export type PredictWaitTimeInput = z.infer<typeof PredictWaitTimeInputSchema>;

const PredictWaitTimeOutputSchema = z.object({
  estimatedWaitTime: z.number().describe('The estimated wait time for the order, in minutes.'),
  reasoning: z.string().describe('The reasoning behind the estimated wait time.'),
});
export type PredictWaitTimeOutput = z.infer<typeof PredictWaitTimeOutputSchema>;

// Tool to get menu item details
const getMenuItemDetails = ai.defineTool(
    {
        name: 'getMenuItemDetails',
        description: 'Get details for a menu item by its ID, including its average preparation time.',
        inputSchema: z.object({ outletId: z.string(), itemId: z.string() }),
        outputSchema: z.object({
            id: z.string(),
            name: z.string(),
            averagePrepTime: z.number(),
        }).optional(),
    },
    async ({ outletId, itemId }) => {
        const { firestore } = initializeFirebase();
        if (!firestore) return undefined;
        
        const itemRef = doc(firestore, 'outlets', outletId, 'menu_items', itemId);
        const itemSnap = await getDoc(itemRef);

        if (!itemSnap.exists()) return undefined;

        const item = itemSnap.data();

        return {
            id: item.id,
            name: item.name,
            averagePrepTime: item.averagePrepTime,
        };
    }
);


export async function predictWaitTime(input: PredictWaitTimeInput): Promise<PredictWaitTimeOutput> {
  return predictWaitTimeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictWaitTimePrompt',
  input: {schema: PredictWaitTimeInputSchema},
  output: {schema: PredictWaitTimeOutputSchema},
  tools: [getMenuItemDetails],
  prompt: `You are an AI assistant that predicts the estimated wait time for customer orders in a cafeteria.

You are provided with the following information about the current order:
- The outlet ID: {{{outletId}}}
- The items in the order (item IDs): {{{itemIds}}}
- The time the order is being placed: {{{orderTime}}}
- The current number of orders in the queue: {{{queueDepth}}}

Your goal is to provide an accurate wait time in minutes and a brief justification.

To do this, you MUST follow these steps:
1. For EACH item ID in the order, use the 'getMenuItemDetails' tool to fetch its average preparation time. Make sure to pass both outletId and itemId.
2. Sum the preparation times for all items. This is the base cooking time.
3. Consider the 'queueDepth'. A larger queue means more waiting. A simple but effective model is to add 2-3 minutes for each order already in the queue.
4. Consider the 'orderTime'. Peak hours (like 12:00 PM - 2:00 PM) should have slightly longer wait times. Add a buffer of 5-10 minutes during these peak times.
5. Combine these factors: (Base Cooking Time) + (Queue-based Wait) + (Peak Hour Buffer) = Total Estimated Wait Time.
6. Provide a concise 'reasoning' string explaining how you arrived at your estimate, mentioning the key factors (e.g., "Based on a queue of {{{queueDepth}}} orders and the complexity of the items, including...").

Output your final prediction in the required JSON format.
`,
});

const predictWaitTimeFlow = ai.defineFlow(
  {
    name: 'predictWaitTimeFlow',
    inputSchema: PredictWaitTimeInputSchema,
    outputSchema: PredictWaitTimeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
