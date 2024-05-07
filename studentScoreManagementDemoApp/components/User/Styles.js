import { StyleSheet } from "react-native";
import { Color, FontFamily, FontSize } from "../../styles/MyStyle";

export default StyleSheet.create({
  log: {
    backgroundColor: "#b3b3cc",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  log_items: {
    width: "80%",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#fff"
  },
  button: {
    justifyContent: "space-around",
    alignItems: "center",
    width: "80%",
    flexDirection: "row",
  }
});