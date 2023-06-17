import React from "react";

import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import Speech from "Speech";
import Result from "Result";
import History from "History";

const RootStack = createStackNavigator();

const Route = () => {
  return (
    <NavigationContainer>
      <RootStack.Navigator>
        <RootStack.Screen
          name="Speech"
          options={{
            headerShown: false,
          }}
          component={Speech}
        />
        <RootStack.Screen
          name="Result"
          options={{
            headerShown: false,
          }}
          component={Result}
        />
        <RootStack.Screen
          name="History"
          options={{
            headerShown: false,
          }}
          component={History}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default Route;
