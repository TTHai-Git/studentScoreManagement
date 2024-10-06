import { StyleSheet } from "react-native";

export default StyleSheet.create({
  class: {
    width: "100%",
    backgroundColor: "#99ffff",
    padding: 10,
    marginTop: 10,
    justifyContent: "center",
    borderWidth: 2,
    borderRadius: 10,
  },
  text_class: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  text_red_color: {
    color: "#fa0707",
  },
  topic: {
    width: "100%",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderRadius: 10,
  },
  button_topic: {
    width: 200,
  },
  addTopic_Comment: {
    width: "100%",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "black",
  },
  button_del: {
    backgroundColor: "#ff0000",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText_del: {
    color: "#fff",
    textAlign: "center",
    marginLeft: 5,
  },
});
