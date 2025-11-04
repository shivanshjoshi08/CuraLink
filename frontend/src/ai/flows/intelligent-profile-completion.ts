
// src/ai/flows/intelligent-profile-completion.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for intelligent profile completion.
 *
 * The flow analyzes natural language input describing a patient's medical conditions and extracts
 * relevant conditions to populate their profile.
 *
 * @exports intelligentProfileCompletion - The main function to trigger the flow.
 * @exports IntelligentProfileCompletionInput - The input type for the flow.
 * @exports IntelligentProfileCompletionOutput - The output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentProfileCompletionInputSchema = z.object({
  medicalConditionsText: z
    .string()
    .describe(
      'Natural language input describing the patient medical conditions, e.g., \"I have type 2 diabetes and high blood pressure.\"'
    ),
});
export type IntelligentProfileCompletionInput = z.infer<
  typeof IntelligentProfileCompletionInputSchema
>;

const IntelligentProfileCompletionOutputSchema = z.object({
  extractedConditions: z
    .array(z.string())
    .describe('A list of extracted medical conditions.'),
});
export type IntelligentProfileCompletionOutput = z.infer<
  typeof IntelligentProfileCompletionOutputSchema
>;

export async function intelligentProfileCompletion(
  input: IntelligentProfileCompletionInput
): Promise<IntelligentProfileCompletionOutput> {
  return intelligentProfileCompletionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentProfileCompletionPrompt',
  input: {schema: IntelligentProfileCompletionInputSchema},
  output: {schema: IntelligentProfileCompletionOutputSchema},
  prompt: `You are a medical expert. Extract a list of medical conditions from the following text.  Respond with a list of strings.

Text: {{{medicalConditionsText}}}`,
});

const intelligentProfileCompletionFlow = ai.defineFlow(
  {
    name: 'intelligentProfileCompletionFlow',
    inputSchema: IntelligentProfileCompletionInputSchema,
    outputSchema: IntelligentProfileCompletionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
