import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ouzsshozzlvygqkumqme.supabase.co";
const supabaseKey = "sb_publishable_AJzGKdEDgsPEe9jXFb9oUg_Nfcpny2d";

export const supabase = createClient(supabaseUrl, supabaseKey);