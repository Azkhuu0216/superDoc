import { Dimensions, StyleSheet, Text, View } from "react-native";
import React from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

interface IConversation {
  no: number;
  message: string;
}

const Conversation = ({ no, message }: IConversation) => {
  const navigation: any = useNavigation();
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() =>
        navigation.navigate("Result", {
          data: {
            conversation_id: no,
            is_history: true,
          },
        })
      }
    >
      <Text style={styles.title}>Conversation #{no}</Text>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.divider} />
    </TouchableOpacity>
  );
};

export default Conversation;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
  },
  divider: {
    borderWidth: 1,
    height: 2,
    width: width - 50,
    marginVertical: 15,
  },
  title: {
    fontSize: 17,
    fontWeight: "400",
    color: "#000000",
  },
  message: {
    fontSize: 13,
    fontWeight: "400",
    color: "rgba(0, 0, 0, 0.5)",
    marginTop: 5,
  },
});
