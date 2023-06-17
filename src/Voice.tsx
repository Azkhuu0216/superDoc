import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import LottieView from "lottie-react-native";

const { width } = Dimensions.get("window");

interface IVoice {
  right?: string;
  duration?: string;
  voice?: string;
  isPlaying: boolean;
  transcript: string;
  handlePlay: (value: string) => void;
  index: number;
  lastChild: number;
  loading: boolean;
}

const Voice = ({
  right,
  transcript,
  isPlaying,
  handlePlay,
  index,
  lastChild,
  loading,
  voice = "https://fibo-resources.s3.ap-southeast-1.amazonaws.com/audio/response-ttsMP3.com_VoiceText_2023-6-16_23_33_33.mp3",
}: IVoice) => {
  console.log(loading);
  const [collapse, setCollapse] = useState(false);
  return (
    <View
      style={[
        styles.container,

        {
          alignSelf: right === "sent" ? "flex-end" : "flex-start",
          backgroundColor: right === "sent" ? "#375FFF" : "rgba(0, 0, 0, 0.06)",
          marginBottom: lastChild === index && loading ? 120 : 0,
        },
        collapse && {
          width: width - 100,
        },
        loading && {
          padding: 5,
        },
      ]}
    >
      {loading ? (
        <LottieView
          style={styles.loader}
          source={require("../assets/lottie/loader.json")}
          autoPlay
        />
      ) : (
        <>
          <TouchableOpacity onPress={() => handlePlay(voice)}>
            {collapse ? (
              <View style={{ flexDirection: "row" }}>
                <Image
                  source={
                    right === "sent"
                      ? require("../assets/images/sound.png")
                      : require("../assets/images/soundblack.png")
                  }
                  style={{ width: width / 3, height: 20 }}
                />
                <Image
                  source={
                    right === "sent"
                      ? require("../assets/images/sound.png")
                      : require("../assets/images/soundblack.png")
                  }
                  style={{ width: width / 3, height: 20 }}
                />
              </View>
            ) : (
              <Image
                source={
                  right === "sent"
                    ? require("../assets/images/sound.png")
                    : require("../assets/images/soundblack.png")
                }
                style={{ width: width / 2.5, height: 20 }}
              />
            )}
          </TouchableOpacity>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 5,
              justifyContent: "space-between",
            }}
          >
            {/* <AntDesign name="caretright" size={10} color={"white"} /> */}
            {!collapse && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <FontAwesome
                  name={isPlaying ? "pause" : "play"}
                  size={10}
                  color={right === "sent" ? "white" : "black"}
                  onPress={() => handlePlay(voice)}
                />

                <Text
                  style={{
                    color: right === "sent" ? "white" : "black",
                    marginHorizontal: 10,
                  }}
                >
                  0:20
                </Text>
              </View>
            )}
            <TouchableOpacity
              onPress={() => setCollapse(!collapse)}
              style={[
                { flex: 1, paddingVertical: 10 },
                collapse &&
                  right === "sent" && {
                    borderLeftWidth: 1,
                    borderLeftColor: "#ffffff",
                    paddingLeft: 20,
                    marginLeft: 10,
                  },
                collapse &&
                  right === "recieved" && {
                    borderRightWidth: 1,
                    paddingRight: 20,
                    marginRight: 10,
                    borderRightColor: "#000000",
                  },
              ]}
            >
              <Text
                style={{ color: right === "sent" ? "white" : "black", flex: 1 }}
              >
                {collapse ? transcript : "View transcript"}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default Voice;

const styles = StyleSheet.create({
  container: {
    width: width / 2.2,
    padding: 10,
    margin: 16,
    borderRadius: 4,
  },
  loader: {
    height: 50,
    alignSelf: "center",
  },
});
