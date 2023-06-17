import Route from "Route";
import React, { useState } from "react";
import { LogBox, Text, TouchableOpacity } from "react-native";
import SoundPlayer from "react-native-sound-player";

LogBox.ignoreAllLogs();

const App = () => {
  const [play, setPlay] = useState(false);
  const toggle = () => {
    if (play) {
      SoundPlayer.stop();
      setPlay(false);
    } else {
      SoundPlayer.playUrl(
        "https://fibo-resources.s3.ap-southeast-1.amazonaws.com/audio/e37d9e19-1383-40f7-8798-8a4ec8f3f689.mp3"
      );
      setPlay(true);
    }
  };

  return <Route />;

  // return (
  //   <TouchableOpacity
  //     onPress={() => toggle()}
  //     style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
  //   >
  //     <Text style={{ color: "white" }}>Play</Text>
  //   </TouchableOpacity>
  // );
};

export default App;
