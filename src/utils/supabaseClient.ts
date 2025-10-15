import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabaseClient = createClient(supabaseUrl, supabaseKey);

export async function checkTableExists(tableName: string) {
    const { data, error } = await supabaseClient
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', tableName)

    if (error) {
        console.error('查询失败:', error)
        return false
    }

    return data && data.length > 0
}
