import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.https://ypjsrtctfazxlnwcxtyw.supabase.co!;
const supabaseAnonKey = process.env.sb_publishable_FMKKD-XifaEPuVxI3SJ3UA_7zNPMczD!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
