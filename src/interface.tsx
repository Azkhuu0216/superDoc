export interface Conversation {
  id: number;
  updated_at: string;
  created_at: string;
  uuid: string;
  name: string;
  customer_id: number;
  first_message_id: number;
  first_message: Message;
}

export interface Message {
  id: number;
  updated_at: string;
  created_at: string;
  customer_id: number;
  conversation_id: number;
  message_url: string;
  message_text: string;
  message_type: string;
  message_status: string;
}
