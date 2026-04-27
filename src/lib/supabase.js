import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://oqyamcofwbepnpslsepr.supabase.co";
const supabaseKey = "sb_publishable_vXulArNJsmo2Wz5s-rUOiA_RBLwLYst";

export const supabase = createClient(supabaseUrl, supabaseKey);