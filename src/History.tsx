import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { atomDeviceId } from "store";
import LottieView from "lottie-react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useNavigation } from "@react-navigation/native";
import { fetchConversations } from "api";
import { Conversation } from "interface";
import HistoryRow from "./Conversation";

interface historyStruct {
  [x: string]: Conversation[];
}
const History = () => {
  const navigation = useNavigation();
  const [device] = useAtom(atomDeviceId);
  const [loading, setLoading] = useState(true);
  const [historyList, setHistoryList] = useState<historyStruct>({});

  useEffect(() => {
    setLoading(true);
    // setInterval(() => {
    getConversations();
    // }, 3000);
  }, []);

  const getConversations = () => {
    fetchConversations(device).then((result) => {
      setHistoryList(result);
      setLoading(false);
    });
  };
  if (loading) {
    return (
      <LottieView
        style={styles.loader}
        source={require("../assets/lottie/loader.json")}
        autoPlay
      />
    );
  }
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
        <View style={{ marginHorizontal: 16 }}>
          <Text style={styles.headingText}>History</Text>
        </View>
      </View>

      <ScrollView>
        {Object.keys(historyList)?.map((key) => {
          return (
            <View>
              <Text style={styles.paragraph}>{key}</Text>
              {(historyList[key] as any[]).map((item, index) => (
                <HistoryRow
                  no={item.first_message?.conversation_id}
                  message={item.first_message?.message_text}
                  key={index}
                />
              ))}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default History;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  headingText: {
    fontWeight: "bold",
    fontSize: 35,
    color: "#54A3FF",
  },
  paragraph: {
    fontSize: 14,
    alignSelf: "center",
    marginVertical: 20,
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
