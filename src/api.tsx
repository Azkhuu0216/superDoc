import { URL } from "config";
export const fetchMessages = async (
  conversation_id: string,
  device: string
) => {
  return fetch(`${URL}/customer/conversation/message/list`, {
    method: "POST",
    body: JSON.stringify({
      conversation_id: parseInt(conversation_id),
    }),
    headers: {
      "device-id": device,
    },
  })
    .then((resp) => resp.json())
    .then((result) => result?.body);
};

export const fetchConversations = async (device: string) => {
  return fetch(`${URL}/customer/conversation/list`, {
    method: "POST",
    headers: {
      "device-id": device,
    },
  })
    .then((resp) => resp.json())
    .then((result) => result?.body);
};

export const fetchConversation = async (
  conversation_id: string,
  device: string
) => {
  return fetch(`${URL}/customer/conversation/get/${conversation_id}`, {
    method: "GET",
    headers: {
      "device-id": device,
    },
  })
    .then((resp) => resp.json())
    .then((result) => result?.body);
};

export const postConversation = async (device: string) => {
  return fetch(`${URL}/customer/conversation/create`, {
    method: "POST",
    headers: {
      "device-id": device,
    },
  })
    .then((resp) => resp.json())
    .then((result) => result?.body);
};

export const postMessage = async (params: string, device: string) => {
  return fetch(`${URL}/customer/conversation/message/send`, {
    method: "POST",
    body: params,
    headers: {
      "device-id": device,
    },
  }).then((resp) => resp.json());
};

export const uploadAudio = async (formData: FormData, device: string) => {
  return fetch(`${URL}/file/upload`, {
    method: "POST",
    body: formData,
    headers: {
      "device-id": device,
    },
  }).then((resp) => resp.json());
};
