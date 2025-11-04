
"use server";

import { generatePublicationSummary } from "@/ai/flows/generate-publication-summary";
import { intelligentProfileCompletion } from "@/ai/flows/intelligent-profile-completion";
import { z } from "zod";

const profileSchema = z.object({
  medicalConditionsText: z.string().min(10, "Please describe your conditions in more detail."),
});

export async function handleIntelligentProfileCompletion(prevState: any, formData: FormData) {
  const validatedFields = profileSchema.safeParse({
    medicalConditionsText: formData.get('medicalConditionsText'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await intelligentProfileCompletion({
      medicalConditionsText: validatedFields.data.medicalConditionsText,
    });
    return {
      data: result.extractedConditions,
    };
  } catch (error) {
    console.error(error);
    return {
      error: "An error occurred while analyzing your information. Please try again.",
    };
  }
}


const summarySchema = z.object({
  publicationText: z.string(),
});

export async function handleGenerateSummary(publicationText: string) {
  const validatedFields = summarySchema.safeParse({ publicationText });

  if (!validatedFields.success) {
    return { error: "Invalid publication text." };
  }
  
  try {
    const result = await generatePublicationSummary({ publicationText });
    return { data: result.summary };
  } catch (error) {
    console.error(error);
    return { error: "Failed to generate summary. Please try again." };
  }
}
