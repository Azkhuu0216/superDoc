import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Sound from "react-native-sound";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { formatTime } from "./utils";

const { width } = Dimensions.get("window");

interface IVoice {
  right?: string;
  diagnosis_level: string;
  pre_diagnosis?: string;
  diagnosis?: string;
  duration?: string;
  voice: string;
  isCurrentIndex: boolean;
  transcript: string;
  changeIndex?: () => void;
  loading: boolean;
  sound?: Sound;
  isDone?: boolean;
  icon_code?: number;
  // autoPlay?: boolean;
}

const Voice = ({
  right,
  transcript,
  isCurrentIndex,
  changeIndex,
  loading,
  isDone,
  sound,
  diagnosis_level,
  diagnosis,
  icon_code,
  // autoPlay,
  pre_diagnosis,
}: IVoice) => {
  const intervalID = useRef<NodeJS.Timeout>();
  const [collapse, setCollapse] = useState(false);
  const [play, setPlay] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const doneFormat = {
    priority: {
      color: "#D9AD13",
      text: "Hospital Care",
      image: require("../assets/images/priority.png"),
    },
    non_urgent: {
      color: "#09C99B",
      text: "Outpatient Visit",
      image: require("../assets/images/non_urgent.png"),
    },
    high_urgency: {
      color: "#B62323",
      text: "Transfer to Critical Care",
      image: require("../assets/images/emergency.png"),
    },
  } as { [x: string]: any };

  const dFormat = [
    require("../assets/images/mosquito.png"),
    require("../assets/images/infection.png"),
    require("../assets/images/knee.png"),
    require("../assets/images/brain.png"),
    require("../assets/images/gastrointestinal.png"),
    require("../assets/images/lungs.png"),
    require("../assets/images/heart.png"),
    require("../assets/images/upper.png"),
    require("../assets/images/kwashiorkor.png"),
    require("../assets/images/cancer.png"),
    require("../assets/images/back.png"),
  ];

  const handlePlay = () => {
    setPlay(true);
    sound?.play(() => {
      sound?.release();
      // setPlay(false);
    });
  };

  const handleStop = () => {
    sound?.stop(() => {
      setPlay(false);
    });
  };

  const toggleRecord = () => {
    changeIndex && changeIndex();
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
    if (isCurrentIndex && sound) {
      sound.getCurrentTime((seconds) => setCurrentTime(seconds));
    }
  };

  // useEffect(() => {
  //   if (autoPlay) {
  //     console.warn("god");
  //     setTimeout(() => {
  //       handlePlay();
  //     }, 1000);
  //   }
  // }, [autoPlay]);

  useEffect(() => {
    if (!isCurrentIndex) handleStop();
  }, [isCurrentIndex]);

  const duration = sound?.getDuration() || 0;
  const diff = duration - currentTime;
  const percent = (currentTime / duration) * 100;
  if (isDone) {
    return (
      <>
        <View
          style={[
            styles.done,
            {
              backgroundColor: doneFormat?.[diagnosis_level]?.color,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
            },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                backgroundColor: "rgba(255, 255, 255, 0.2);",
                borderRadius: 100,
                justifyContent: "center",
                alignItems: "center",
                opacity: 1,
              }}
            >
              <Image
                source={doneFormat?.[diagnosis_level]?.image}
                style={{
                  width: 40,
                  height: 40,
                }}
              />
            </View>
            <Text style={{ fontSize: 16, color: "white", fontWeight: "600" }}>
              {doneFormat?.[diagnosis_level]?.text}
            </Text>
          </View>
          <View style={styles.doneButton}>
            <Text
              style={{
                color: doneFormat?.[diagnosis_level]?.color,
                paddingHorizontal: 20,
                paddingVertical: 10,
                textAlign: "center",
                fontWeight: "500",
                textTransform: "capitalize",
                fontSize: 18,
              }}
            >
              {diagnosis_level?.replace("_", " ")}
            </Text>
          </View>
          <View
            style={{
              borderBottomColor: "white",
              opacity: 0.5,
              marginVertical: 15,
              borderBottomWidth: StyleSheet.hairlineWidth,
            }}
          />
          <View>
            <Text style={{ flex: 1, color: "white", fontSize: 16 }}>
              {diagnosis}
            </Text>
          </View>
        </View>
        {pre_diagnosis && (
          <View
            style={[
              styles.done,
              {
                backgroundColor: "#d6d6d6",
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
              },
            ]}
          >
            <Text style={{ fontSize: 20 }}>DIAGNOSIS</Text>
            <View
              style={{
                borderBottomColor: "#303030",
                opacity: 0.6,
                marginVertical: 15,
                borderBottomWidth: StyleSheet.hairlineWidth,
              }}
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {icon_code !== undefined && (
                <Image
                  source={dFormat?.[icon_code - 1]}
                  style={{
                    width: 40,
                    height: 40,
                  }}
                />
              )}
              {!!pre_diagnosis && (
                <Text
                  style={{
                    color: "#303030",
                    fontSize: 20,
                    marginLeft: 10,
                    flex: 1,
                  }}
                >
                  {pre_diagnosis}
                </Text>
              )}
            </View>
          </View>
        )}
      </>
    );
  }
  const isBot = right === "recieved";
  const data = right === "sent" ? transcript : `🦸 SuperDoc: ${transcript}`;
  return (
    <View
      style={[
        styles.container,
        {
          alignSelf: right === "sent" ? "flex-end" : "flex-start",
          backgroundColor: right === "sent" ? "#375FFF" : "rgba(0, 0, 0, 0.06)",
        },
        (collapse || isBot) && {
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
                  backgroundColor: right === "received" ? "#002ad4" : "#333333",
                }}
              />
            )}
            {collapse || isBot ? (
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
              marginTop: 10,
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
              onPress={() => {
                if (!isBot) setCollapse(!collapse);
              }}
              style={[
                { flex: 1 },
                collapse &&
                  right === "sent" && {
                    borderLeftWidth: 1,
                    borderLeftColor: "#ffffff",
                    paddingLeft: 20,
                    marginLeft: 10,
                  },
                (collapse || isBot) &&
                  right === "received" && {
                    borderRightWidth: 1,
                    paddingRight: 20,
                    marginRight: 10,
                    borderRightColor: "#333333",
                  },
              ]}
            >
              <Text
                style={{
                  color: right === "sent" ? "white" : "black",
                  flex: 1,
                  fontSize: 12,
                  alignSelf: "flex-end",
                }}
              >
                {collapse || isBot ? data : "View transcript"}
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
    padding: 12,
    margin: 16,
    borderRadius: 18,
  },
  loader: {
    height: 70,
    alignSelf: "center",
  },
  done: {
    padding: 20,
    marginHorizontal: 16,
  },
  doneButton: {
    color: "#D9AD13",
    backgroundColor: "white",
    borderRadius: 90,
  },
});
