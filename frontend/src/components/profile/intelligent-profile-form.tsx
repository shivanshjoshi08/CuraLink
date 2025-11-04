
"use client";

import { handleIntelligentProfileCompletion } from "@/lib/actions";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Lightbulb, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const initialState = {
  data: undefined,
  error: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Analyze and Add Conditions
    </Button>
  );
}

export function IntelligentProfileForm() {
  const [state, formAction] = useActionState(handleIntelligentProfileCompletion, initialState);
  const [conditions, setConditions] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.data) {
        setConditions(prev => [...new Set([...prev, ...state.data as string[]])]);
        toast({
            title: "Conditions Added",
            description: "We've updated your profile with the extracted conditions.",
        })
    }
    if(state?.error && typeof state.error === 'string') {
        toast({
            title: "An Error Occurred",
            description: state.error,
            variant: "destructive"
        })
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Textarea
          id="medicalConditionsText"
          name="medicalConditionsText"
          placeholder="e.g., 'I was diagnosed with type 2 diabetes five years ago and also have high blood pressure.'"
          rows={4}
          required
        />
        {state?.error && typeof state.error !== 'string' && state.error.medicalConditionsText && (
          <p className="text-sm font-medium text-destructive">
            {state.error.medicalConditionsText[0]}
          </p>
        )}
      </div>
      <SubmitButton />

      {(conditions.length > 0) && (
        <Card className="mt-6 bg-secondary/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    Extracted Conditions
                </CardTitle>
                <CardDescription>
                    These conditions have been added to your profile. You can manage them in your profile details.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="flex flex-wrap gap-2">
                    {conditions.map((condition) => (
                        <Badge key={condition} variant="default">{condition}</Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
      )}
    </form>
  );
}
