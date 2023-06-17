import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";

import AudioRecord from "react-native-audio-record";
import { MotiView } from "moti";
import { Easing } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import Voice from "@react-native-voice/voice";
import { useAtom } from "jotai";
import { atomDeviceId, atomQuestion } from "store";
import { getUniqueId } from "react-native-device-info";
import axios from "axios";
const _color = "white";
const _size = 120;

const url = "http://54.158.196.250:8000/api/v1";

const Speech = () => {
  const [device, setDevice] = useAtom(atomDeviceId);
  const [conversation, setConversation] = useState<number>();
  const [isLoading, setLoading] = useState(false);
  const [toggle, setToggle] = useState(false);
  const navigation: any = useNavigation();
  const [state, setState] = useState({
    audioFile: "",
    recording: false,
    loaded: false,
    paused: false,
  });
  const [result, setResult] = useAtom(atomQuestion);

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
    fetch(`${url}/customer/conversation/create`, {
      method: "POST",
      headers: {
        "device-id": device,
      },
    })
      .then((resp) => resp.json())
      .then((result) => {
        setConversation(result.body.id);
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
          conversation_id: conversation,
          message_url: res.body.path,
        });
        console.log(params, "parsm---------");
        fetch(`${url}/customer/conversation/message/send`, {
          method: "POST",
          body: params as any,
          headers: {
            "device-id": device,
          },
        })
          .then((resp) => resp.json())
          .then((result) => {
            console.log(result, "sentRes00000>");
            navigation.navigate("Result", {
              data: {
                conversation_id: conversation,
              },
            });
          });
      });
  };

  const onSpeechEndHandler = (e: any) => {
    setLoading(false);
  };

  const onSpeechResultsHandler = (e: any) => {
    let text = e.value[0];
    setResult(text);
    console.log("speech result handler", e);
  };
  const startRecording = async () => {
    setLoading(true);
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
                      borderColor: _color,
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
    width: _size,
    height: _size,
    borderRadius: _size,
    borderWidth: 1,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Speech;
