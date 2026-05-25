import { Link } from "react-router-dom";
import { Lock, Sparkles } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
  children: React.ReactNode;
}

export function SubscriptionGate({ children }: Props) {
  const { data, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  if (!data?.isActive) {
    return (
      <div className="mx-auto max-w-xl py-12">
        <Card className="border-primary/40">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Upgrade to start uploading</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose a plan to unlock bulk creative uploads, ad set assignments,
                and one-click launches.
              </p>
            </div>
            <Button asChild size="lg">
              <Link to="/billing">
                <Sparkles className="mr-2 h-4 w-4" />
                View plans
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
