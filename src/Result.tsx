import Voice from "@react-native-voice/voice";
import { useNavigation } from "@react-navigation/native";
import VoiceComponent from "Voice";
import {
  fetchConversation,
  fetchMessages,
  postMessage,
  uploadAudio,
} from "api";
import { WAVE_WIDTH, defaultConversation } from "config";
import { Conversation, Message } from "interface";
import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AudioRecord from "react-native-audio-record";
import Sound from "react-native-sound";
import AntDesign from "react-native-vector-icons/AntDesign";
import Feather from "react-native-vector-icons/Feather";
import { atomDeviceId, atomQuestion } from "store";

let tempMessage: Message[] = [];
const Result = ({ route }: any) => {
  const [question, setQuestion] = useAtom(atomQuestion);
  const conversation_id = route?.params?.data.conversation_id;
  const is_history = route?.params?.data.is_history;
  const clean = route?.params?.data.clean;
  const [device] = useAtom(atomDeviceId);
  const [toggle, setToggle] = useState(false);
  const [conversation, setConversation] =
    useState<Conversation>(defaultConversation);
  const [state, setState] = useState({
    audioFile: "",
    recording: false,
    loaded: false,
    paused: false,
  });
  const [currentVoice, setCurrentVoice] = useState<number>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastMessageStatus, setLastMessageStatus] = useState(
    messages?.[messages.length - 1]?.message_status
  );
  useEffect(() => {
    setMessages([]);
  }, [clean]);
  useEffect(() => {
    Sound.setCategory("Playback", true); // true = mixWithOthers

    tempMessage = messages.map((message) => {
      return {
        ...message,
        sound: new Sound(message.message_url, "", (err) => {
          if (err) {
            return;
          }
        }),
      };
    });

    return () => {
      tempMessage.map((message) => {
        if (message.sound) {
          message.sound.release();
        }
      });
    };
  }, [messages]);

  useEffect(() => {
    const options = {
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      audioSource: 6,
      wavFile: "test.mp3",
    };

    AudioRecord.init(options);
    AudioRecord.on("data", (data) => {});

    Voice.onSpeechStart;
    Voice.onSpeechResults = onSpeechResultsHandler;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);
  useEffect(() => {
    let interval: any;
    if (lastMessageStatus === "loading" || !lastMessageStatus) {
      interval = setInterval(() => {
        getMessages();
        getConversation();
      }, 3000);
    }
    return () => {
      clearInterval(interval);
    };
  }, [lastMessageStatus]);

  const getConversation = () => {
    fetchConversation(conversation_id, device).then((result) => {
      setConversation(result);
    });
  };

  const getMessages = () => {
    fetchMessages(conversation_id, device).then((result) => {
      setMessages(result);

      setLastMessageStatus(result?.[result.length - 1]?.message_status);
    });
  };

  const toggleRecord = () => {
    if (toggle) {
      stop();
      stopRecording();
    } else {
      start();
      startRecording();
    }
    setToggle(!toggle);
  };

  const start = () => {
    AudioRecord.start();
    setState({ ...state, audioFile: "", recording: true, loaded: false });
  };

  const stop = async () => {
    if (!state.recording) return;
    let audofile = await AudioRecord.stop();
    uploadFile(audofile);

    setState({ ...state, audioFile: audofile, recording: false });
  };

  const uploadFile = async (audofile: string) => {
    const formData = new FormData();
    formData.append("file", {
      name: "test.mp3",
      uri: audofile,
      type: "audio/mp3",
    });
    uploadAudio(formData, device).then((res) => {
      const params = JSON.stringify({
        conversation_id: conversation_id,
        message_text: question,
        message_url: res.body.path,
      });
      postMessage(params, device).then(() => {
        getMessages();
        getConversation();
      });
    });
  };

  const onSpeechResultsHandler = (e: any) => {
    let text = e.value[0] as string;
    setQuestion(text);
    setConversation({
      ...defaultConversation,
      first_message: {
        ...defaultConversation.first_message,
        message_text: text,
      },
    });
  };
  const startRecording = async () => {
    try {
      await Voice.start("en-Us");
    } catch (error) {
      console.log("error raised", error);
    }
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
    } catch (error) {
      console.log("error raised", error);
    }
  };

  console.log(lastMessageStatus);

  const text = is_history
    ? conversation?.first_message?.message_text || "Loading"
    : question || "Loading";
  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginHorizontal: 16,
            backgroundColor: "#FFEBB9",
            padding: 16,
            marginRight: 24,
            borderRadius: 8,
          }}
        >
          <Feather name="alert-circle" size={24} color={"black"} />
          <View style={{ flex: 1 }}>
            <Text style={styles.question}>{text}</Text>
          </View>
        </View>
      </View>
      <ScrollView>
        <Text style={{ alignSelf: "center", marginTop: 50, marginBottom: 20 }}>
          {new Date(conversation?.created_at).toLocaleDateString()}
        </Text>

        {tempMessage?.map((voice, index) => (
          <VoiceComponent
            sound={voice.sound}
            pre_diagnosis={conversation.pre_diagnosis}
            diagnosis_level={conversation.diagnosis_level}
            diagnosis={conversation.diagnosis}
            right={voice.message_type}
            transcript={voice.message_text}
            isCurrentIndex={currentVoice === index}
            changeIndex={() => {
              setCurrentVoice(index);
            }}
            loading={false}
            key={index}
            voice={voice.message_url}
          />
        ))}
        {(lastMessageStatus === "loading" ||
          lastMessageStatus === undefined) && (
          <VoiceComponent
            right={"recieved"}
            isCurrentIndex={false}
            loading={true}
            transcript={""}
            voice=""
            diagnosis_level=""
          />
        )}
        {lastMessageStatus !== "loading" &&
          lastMessageStatus !== undefined &&
          conversation?.diagnosis?.length > 0 &&
          conversation?.diagnosis && (
            <VoiceComponent
              right={"recieved"}
              isCurrentIndex={false}
              loading={true}
              transcript={""}
              voice=""
              isDone={true}
              pre_diagnosis={conversation.pre_diagnosis}
              diagnosis_level={conversation.diagnosis_level}
              diagnosis={conversation.diagnosis}
            />
          )}
      </ScrollView>
      {conversation.diagnosis?.length === 0 && (
        <TouchableOpacity
          onPress={toggleRecord}
          disabled={lastMessageStatus === "loading"}
          style={[styles.start, toggle && { borderWidth: 0 }]}
        >
          <Image
            source={require("../assets/images/Mic_fill.png")}
            style={{ width: 50, height: 50 }}
          />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default Result;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  start: {
    borderWidth: 2,
    borderRadius: 100,
    alignSelf: "center",
    padding: 10,
    borderColor: "blue",
    marginTop: 10,
  },
  question: {
    marginLeft: 10,
    fontWeight: "600",
  },
  dot: {
    width: WAVE_WIDTH / 2,
    height: WAVE_WIDTH / 2,
    borderRadius: WAVE_WIDTH,
    borderWidth: 1,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
});
