import Sound from "react-native-sound";

export interface Conversation {
  confidence_percent: number;
  created_at: string;
  customer_id: number;
  diagnosis: string;
  diagnosis_level: string;
  first_message: Message;
  first_message_id: number;
  gpt_history: GptHistory[];
  id: number;
  is_finished: boolean;
  name: string;
  pre_diagnosis: string;
  updated_at: string;
  uuid: string;
}

export interface GptHistory {
  content: string;
  role: string;
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
  sound: Sound;
}
