
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating AI-driven summaries of complex clinical trials and publications.
 *
 * - generatePublicationSummary - A function that generates a summary of a publication.
 * - GeneratePublicationSummaryInput - The input type for the generatePublicationSummary function.
 * - GeneratePublicationSummaryOutput - The return type for the generatePublicationSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePublicationSummaryInputSchema = z.object({
  publicationText: z
    .string()
    .describe('The text content of the clinical trial or publication to be summarized.'),
});
export type GeneratePublicationSummaryInput = z.infer<typeof GeneratePublicationSummaryInputSchema>;

const GeneratePublicationSummaryOutputSchema = z.object({
  summary: z
    .string()
    .describe('The AI-generated summary of the clinical trial or publication.'),
});
export type GeneratePublicationSummaryOutput = z.infer<typeof GeneratePublicationSummaryOutputSchema>;

export async function generatePublicationSummary(
  input: GeneratePublicationSummaryInput
): Promise<GeneratePublicationSummaryOutput> {
  return generatePublicationSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePublicationSummaryPrompt',
  input: {schema: GeneratePublicationSummaryInputSchema},
  output: {schema: GeneratePublicationSummaryOutputSchema},
  prompt: `You are an expert medical writer. Summarize the following clinical trial or publication text for patients and researchers, highlighting key findings and implications. Keep it concise and easy to understand.\n\nPublication Text: {{{publicationText}}}`,
});

const generatePublicationSummaryFlow = ai.defineFlow(
  {
    name: 'generatePublicationSummaryFlow',
    inputSchema: GeneratePublicationSummaryInputSchema,
    outputSchema: GeneratePublicationSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
