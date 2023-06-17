import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import Conversation from "Conversation";
import { useAtom } from "jotai";
import { atomDeviceId } from "store";

const url = "http://54.158.196.250:8000/api/v1";

const History = () => {
  const [device, setDevice] = useAtom(atomDeviceId);
  const [historyList, setHistoryList] = useState({});

  useEffect(() => {
    setInterval(() => {
      messageList();
    }, 3000);
  }, []);

  const messageList = () => {
    fetch(`${url}/customer/conversation/list`, {
      method: "POST",
      headers: {
        "device-id": device,
      },
    })
      .then((resp) => resp.json())
      .then((result) => {
        console.log(result.body, "list------->");
        setHistoryList(result?.body);
      });
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ marginHorizontal: 16 }}>
        <Text style={styles.headingText}>History</Text>
      </View>

      <ScrollView>
        {Object.keys(historyList)?.map((key) => {
          return (
            <View>
              <Text style={styles.paragraph}>{key}</Text>
              {(historyList[key] as any[]).map((item, index) => (
                <Conversation
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
    marginTop: 26,
    marginBottom: 10,
    fontWeight: "bold",
    fontSize: 50,
    color: "#54A3FF",
  },
  paragraph: {
    fontSize: 14,
    alignSelf: "center",
    marginVertical: 20,
  },
});
