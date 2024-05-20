import React, { useReducer } from "react";
import Login from "./components/User/Login";
import Register from "./components/User/Register";
import Home from "./components/User/Home";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MyUserReducer from "./reducers/MyUserReducer";
import { NavigationContainer } from "@react-navigation/native";
import MyContext from "./configs/MyContext";
import { Icon } from "react-native-paper";
import Logout from "./components/User/Logout";

const Stack = createStackNavigator;
const MyStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen>Screen 1</Stack.Screen>
      <Stack.Screen>Screen 2</Stack.Screen>
      <Stack.Screen>Screen 3</Stack.Screen>
    </Stack.Navigator>
  );
};

const Tab = createBottomTabNavigator();
const MyTab = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  return (
    <Tab.Navigator screenOptions={{ headerRight: Logout }}>
      {/* <Tab.Screen
        name="Home"
        component={MyStack}
        options={{
          tabBarIcon: () => <Icon size={30} color="blue" source="home" />,
        }}
      /> */}
      <Tab.Screen
        name="Register"
        component={Register}
        options={{
          tabBarIcon: () => <Icon size={30} color="blue" source="account" />,
        }}
      />
      <Tab.Screen
        name="Login"
        component={Login}
        options={{
          tabBarIcon: () => <Icon size={30} color="blue" source="login" />,
        }}
      />
      <Tab.Screen
        name="Personal"
        component={Home}
        options={{
          tabBarIcon: () => <Icon size={30} color="blue" source="human" />,
        }}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  const [user, dispatch] = useReducer(MyUserReducer, null);
  return (
    <MyContext.Provider value={[user, dispatch]}>
      <NavigationContainer>
        <MyTab />
      </NavigationContainer>
    </MyContext.Provider>
  );
}
