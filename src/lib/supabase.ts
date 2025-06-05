import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: 'user' | 'ai';
  text: string | null;
  image_url: string | null;
  created_at: string;
}

export async function createConversation(userId: string, title: string = 'New Chat'): Promise<Conversation> {
  const { data, error } = await supabase
    .from('conversations')
    .insert([{
      id: uuidv4(),
      user_id: userId,
      title,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error inserting new conversation into Supabase:', error);
    const customError = new Error(error.message || 'Failed to create conversation in Supabase');
    if (error.code) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (customError as any).code = error.code;
    }
    throw customError;
  }

  return data;
}

export async function updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation> {
  const { data, error } = await supabase
    .from('conversations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function upsertMessage(message: Omit<Message, 'id' | 'created_at'>): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert([{
      ...message,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  console.log('getMessages called with conversationId:', conversationId);
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error inside getMessages:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error inside getMessages (catch):', error);
    throw error;
  }
}

export async function deleteConversation(id: string): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', id);

  if (error) throw error;
} 