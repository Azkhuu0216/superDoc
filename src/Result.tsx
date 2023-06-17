import {
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import AudioRecord from "react-native-audio-record";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useAtom } from "jotai";
import { atomDeviceId, atomQuestion } from "store";
import Voice from "@react-native-voice/voice";
import VoiceComponent from "Voice";
import Sound from "react-native-sound";

const url = "http://54.158.196.250:8000/api/v1";
const { width } = Dimensions.get("window");
Sound.setCategory("Playback");

const Result = ({ route }: any) => {
  const conversation_id = route?.params?.data.conversation_id;

  const [device, setDevice] = useAtom(atomDeviceId);
  const [toggle, setToggle] = useState(false);
  const [question, setQuestion] = useState("");
  const navigation = useNavigation();
  const [state, setState] = useState({
    audioFile: "",
    recording: false,
    loaded: false,
    paused: false,
  });
  const [currentVoice, setCurrentVoice] = useState<string>();
  const [playing, setPlaying] = useState<boolean>(false);
  const [sample, setSample] = useState([]);
  const [conversation, setConversation] = useState<number>();

  const lastMessage = sample.length - 1;
  const messageStatus = sample[lastMessage]?.message_status;

  useEffect(() => {
    const options = {
      sampleRate: 16000, // default 44100
      channels: 1, // 1 or 2, default 1
      bitsPerSample: 16, // 8 or 16, default 16
      audioSource: 6, // android only (see below)
      wavFile: "test.mp3", // default 'audio.wav'
    };

    AudioRecord.init(options);
    AudioRecord.on("data", (data) => {});

    Voice.onSpeechStart;
    Voice.onSpeechEnd = onSpeechEndHandler;
    Voice.onSpeechResults = onSpeechResultsHandler;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);
  useEffect(() => {
    setInterval(() => {
      messageList();
      getConversation();
    }, 3000);
  }, []);

  const getConversation = () => {
    fetch(`${url}/customer/conversation/get/${conversation_id}`, {
      method: "GET",
      headers: {
        "device-id": device,
      },
    })
      .then((resp) => resp.json())
      .then((result) => {
        setQuestion(result?.body?.first_message?.message_text);
      });
  };

  const messageList = () => {
    fetch(`${url}/customer/conversation/message/list`, {
      method: "POST",
      body: JSON.stringify({
        conversation_id: parseInt(conversation_id),
      }) as any,
      headers: {
        "device-id": device,
      },
    })
      .then((resp) => resp.json())
      .then((result) => {
        // console.log(result, "rrrrrr");
        setSample(result?.body);
      });
  };
  let audio = useRef<any>(null);

  console.log(messageStatus, "status------>");

  useEffect(() => {
    if (
      audio.current?.isPlaying() &&
      currentVoice === audio.current?._filename
    ) {
      stopVoice();
      return;
    }
    if (
      currentVoice !== audio.current?._filename ||
      currentVoice === undefined
    ) {
      audio.current = new Sound(currentVoice, null, (error) => {
        // if (error) {
        //   console.log("failed to load the sound", error);
        //   return;
        // }
        // if loaded successfully
        // console.log(
        //   "duration in seconds: " +
        //     audio.current.getDuration() +
        //     "number of channels: " +
        //     audio.current.getNumberOfChannels()
        // );
      });

      // audio.current.getCurrentTime((seconds) => console.log("at " + seconds));
      audio.current.setVolume(1);
    }

    setTimeout(() => {
      toggleVoice();
    }, 1000);
    return () => {
      audio.current.release();
    };
  }, [currentVoice, playing]);

  const toggleVoice = () => {
    if (audio.current.isPlaying()) {
      stopVoice();
    } else if (currentVoice !== undefined) {
      playVoice();
    }
  };
  const playVoice = () => {
    audio.current.play((success: any) => {
      if (success) {
        stopVoice();
        console.log("successfully finished playing");
      } else {
        stopVoice();
        console.log("playback failed due to audio decoding errors");
      }
    });
  };

  const stopVoice = () => {
    audio.current.pause();
    setCurrentVoice(undefined);
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

  const uploadFile = async (audofile: any) => {
    const formData = new FormData();
    formData.append("file", {
      name: "test.mp3",
      uri: audofile,
      type: "audio/mp3",
    });

    fetch(`${url}/file/upload`, {
      method: "POST",
      body: formData,
      headers: {
        "device-id": device,
      },
    })
      .then((resp) => resp.json())
      .then((res) => {
        const params = JSON.stringify({
          conversation_id: conversation_id,
          message_url: res.body.path,
        });
        fetch(`${url}/customer/conversation/message/send`, {
          method: "POST",
          body: params as any,
          headers: {
            "device-id": device,
          },
        })
          .then((resp) => resp.json())
          .then((result) => {});
      });
  };

  const onSpeechEndHandler = (e: any) => {};

  const onSpeechResultsHandler = (e: any) => {
    let text = e.value[0];
    setQuestion(text);
    console.log("speech result handler", e);
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
  const setPlayingVoice = (voice: string) => {
    setCurrentVoice(voice);
    setPlaying(!playing);
  };

  console.log("god", messageStatus);

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
        }}
      >
        <AntDesign
          name="left"
          size={24}
          color={"black"}
          onPress={() => navigation.goBack()}
        />
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
            <Text style={styles.question}>{question || "Loading"} </Text>
          </View>
        </View>
      </View>
      <ScrollView>
        <Text style={{ alignSelf: "center", marginTop: 50, marginBottom: 20 }}>
          7 May 2023, 17:51
        </Text>
        {sample?.map((voice: any, index) => (
          <VoiceComponent
            right={voice.message_type}
            transcript={voice.message_text}
            isPlaying={currentVoice === voice.message_url}
            handlePlay={() => {
              setPlayingVoice(voice.message_url);
            }}
            loading={false}
            index={index}
            lastChild={sample.length - 1}
            key={index}
          />
        ))}
        {(messageStatus === "loading" || messageStatus === undefined) && (
          <VoiceComponent
            right={"recieved"}
            isPlaying={false}
            loading={true}
            transcript={""}
            handlePlay={() => {}}
            index={sample.length}
            lastChild={sample.length}
          />
        )}
      </ScrollView>
      <TouchableOpacity
        onPress={toggleRecord}
        disabled={messageStatus === "loading"}
        style={[styles.start, toggle && { borderWidth: 0 }]}
      >
        <Image
          source={require("../assets/images/Mic_fill.png")}
          style={{ width: 50, height: 50 }}
        />
      </TouchableOpacity>
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
    position: "absolute",
    bottom: 60,
  },
  question: {
    marginLeft: 10,
    fontWeight: "600",
  },
});
