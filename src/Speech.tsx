import React, { useEffect, useState } from "react";
import { View, Image, Text, StyleSheet, TouchableOpacity } from "react-native";

import AudioRecord from "react-native-audio-record";
import { MotiView } from "moti";
import { Easing } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import Voice from "@react-native-voice/voice";
import { useAtom } from "jotai";
import { atomDeviceId, atomQuestion } from "store";
import { getUniqueId } from "react-native-device-info";
import { postConversation, postMessage, uploadAudio } from "api";
import { WAVE_WIDTH } from "config";

const Speech = () => {
  const [device, setDevice] = useAtom(atomDeviceId);
  const [conversation, setConversation] = useState<number>();
  const [toggle, setToggle] = useState(false);
  const navigation: any = useNavigation();
  const [state, setState] = useState({
    audioFile: "",
    recording: false,
    loaded: false,
    paused: false,
  });
  const [question, setQuestion] = useAtom(atomQuestion);

  useEffect(() => {
    const options = {
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      audioSource: 6,
      wavFile: "test.mp3",
    };

    AudioRecord.init(options);
    Voice.onSpeechStart;
    Voice.onSpeechResults = onSpeechResultsHandler;

    getUniqueId().then((id) => {
      setDevice(id);
    });

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const handleToggle = () => {
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
    postConversation(device).then((body) => {
      setConversation(body.id);
    });

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
    console.log("Question", question);
    uploadAudio(formData, device).then((res) => {
      const params = JSON.stringify({
        conversation_id: conversation,
        message_text: question,
        message_url: res.body.path,
      });
      postMessage(params, device);
    });
    navigation.navigate("Result", {
      data: {
        conversation_id: conversation,
      },
    });
  };

  const onSpeechResultsHandler = (e: any) => {
    let text = e.value[0];
    setQuestion(text);
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

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <Text style={styles.headingText}>Identify</Text>
        <Text style={styles.paragraph}>Tap to tell your symptom clear</Text>
      </View>
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={[styles.center, styles.dot]}>
            {[...Array(3).keys()].map((index) => {
              return (
                <MotiView
                  from={{ opacity: 0, scale: 1 }}
                  animate={{
                    opacity: toggle ? 1 / index : 0,
                    scale: toggle ? 3 : 1,
                  }}
                  transition={{
                    type: "timing",
                    duration: 1000,
                    easing: Easing.out(Easing.ease),
                    delay: 400 * index,
                    loop: true,
                    repeatReverse: true,
                  }}
                  key={index}
                  style={[
                    styles.dot,
                    StyleSheet.absoluteFillObject,
                    toggle && {
                      borderColor: "white",
                    },
                  ]}
                />
              );
            })}

            <TouchableOpacity
              onPress={handleToggle}
              style={[styles.start, toggle && { borderWidth: 0 }]}
            >
              <Image
                source={require("../assets/images/mic.png")}
                style={{ width: 120, height: 120 }}
              />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignSelf: "center",
            flex: 1,
          }}
          onPress={() => navigation.navigate("History")}
        >
          <Text style={styles.history}>History</Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: "white",
              height: 1,
              width: 60,
              position: "absolute",
              top: 22,
            }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "black",
  },
  headingText: {
    marginTop: 26,
    marginBottom: 10,
    fontWeight: "bold",
    fontSize: 60,
    color: "#54A3FF",
  },
  start: {
    borderWidth: 4,
    width: 55,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 1000,
    padding: 120,
    borderColor: "white",
  },
  paragraph: {
    color: "white",
    fontWeight: "bold",
    fontSize: 26,
  },
  history: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  dot: {
    width: WAVE_WIDTH,
    height: WAVE_WIDTH,
    borderRadius: WAVE_WIDTH,
    borderWidth: 1,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Speech;
