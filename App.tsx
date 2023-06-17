import Route from "Route";
import React, { useState } from "react";
import { LogBox, Text, TouchableOpacity } from "react-native";

LogBox.ignoreAllLogs();

const App = () => {
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
