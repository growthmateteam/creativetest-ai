import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Workspace {
  id: string;
  name: string;
  logo_url: string | null;
  timezone: string;
  is_active: boolean;
}

export function useWorkspace() {
  return useQuery<Workspace | null>({
    queryKey: ["workspace"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workspace")
        .select("id, name, logo_url, timezone, is_active")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data ?? null;
    },
  });
}
