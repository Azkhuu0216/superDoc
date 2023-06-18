import { Conversation } from "interface";

// export const URL = "https://5f98-122-201-20-194.jp.ngrok.io/api/v1";
export const URL = "http://54.158.196.250:8000/api/v1";
export const WAVE_WIDTH = 80;
export const defaultConversation: Conversation = {
  id: 0,
  updated_at: "2023-06-17T15:08:05.409025+08:00",
  created_at: "2023-06-17T15:08:01.932868+08:00",
  uuid: "",
  name: "",
  customer_id: 0,
  first_message_id: 0,
  // diagnosis: undefined,
  first_message: {
    id: 0,
    updated_at: "2023-06-17T16:18:54.299109+08:00",
    created_at: "2023-06-17T15:08:05.406152+08:00",
    customer_id: 0,
    conversation_id: 0,
    message_url: "",
    message_text: "",
    message_type: "",
    message_status: "",
  },
};
