import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import LottieView from "lottie-react-native";
// import SoundPlayer from "react-native-sound-player";
import { formatTime } from "./utils";
import Sound from "react-native-sound";
Sound.setCategory("Playback");

const { width } = Dimensions.get("window");

interface IVoice {
  right?: string;
  duration?: string;
  voice: string;
  isCurrentIndex: boolean;
  transcript: string;
  changeIndex?: () => void;
  loading: boolean;
}

const Voice = ({
  right,
  transcript,
  isCurrentIndex,
  changeIndex,
  loading,
  voice,
}: IVoice) => {
  const audio = useRef<Sound>();
  const intervalID = useRef<NodeJS.Timeout>();
  // const [duration, setDuration] = useState(0);
  const [collapse, setCollapse] = useState(false);
  const [play, setPlay] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (voice) {
      audio.current = new Sound(voice, null, (error) => {
        if (error) {
          console.log("failed to load the sound", error);
          return;
        }
      });
    }
  }, [voice]);

  const handlePlay = () => {
    setPlay(true);
    console.log("PLAYINGGGG", audio.current?.play);

    try {
      audio.current?.play((success) => {
        if (success) {
          console.log("successfully finished playing");
        } else {
          console.log("playback failed due to audio decoding errors");
        }

        console.log("duussan esvel togluulj chadq bga");
        // handleStop();
      });
    } catch (err) {
      console.log("golog", err);
    }
  };

  const handleStop = () => {
    console.log("whhy stop");
    audio.current?.stop(() => {
      setPlay(false);
    });
  };

  const toggleRecord = () => {
    changeIndex && changeIndex();
    console.log("gg", play, isCurrentIndex);
    if (play && isCurrentIndex) {
      handleStop();
    } else {
      handlePlay();
    }
  };

  useEffect(() => {
    if (isCurrentIndex) {
      intervalID.current = setInterval(updatePosition, 100);
    }
    return () => clearInterval(intervalID.current);
  }, [isCurrentIndex]);
  const updatePosition = () => {
    if (isCurrentIndex && audio.current) {
      audio.current.getCurrentTime((seconds) => setCurrentTime(seconds));
    }
  };

  // useEffect(() => {
  //   console.log("chamas bolod bnu idda min", voice);
  //   if (!isCurrentIndex) handleStop();
  // }, [isCurrentIndex]);

  const duration = audio.current?.getDuration() || 0;
  const diff = duration - currentTime;
  const percent = (currentTime / duration) * 100;
  return (
    <View
      style={[
        styles.container,
        {
          alignSelf: right === "sent" ? "flex-end" : "flex-start",
          backgroundColor: right === "sent" ? "#375FFF" : "rgba(0, 0, 0, 0.06)",
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
          <TouchableOpacity onPress={toggleRecord}>
            {isCurrentIndex && (
              <Animated.View
                style={{
                  bottom: -4,
                  position: "absolute",
                  zIndex: 99,
                  left: `${percent > 100 ? 100 : percent}%`,
                  width: 5,
                  height: 30,
                  backgroundColor: right === "received" ? "#002ad4" : "#000000",
                }}
              />
            )}
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
            {!collapse && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <FontAwesome
                  name={play ? "pause" : "play"}
                  size={10}
                  color={right === "sent" ? "white" : "black"}
                  onPress={toggleRecord}
                />

                <Text
                  style={{
                    color: right === "sent" ? "white" : "black",
                    marginHorizontal: 10,
                  }}
                >
                  {formatTime(diff > 0 ? diff : 0)}
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
                  right === "received" && {
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
