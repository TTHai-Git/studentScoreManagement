import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    backgroundColor: "#99ebff",
    flex: 1,
    padding: 10,
  },
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  goBack: {
    backgroundColor: "#b3b3cc",
    position: "absolute",
    left: 0,
    top: 70,
  },
  goBack_text: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 20,
  },
  button_user: {
    backgroundColor: "#ff7733",
    margin: 5,
    color: "#ff7733",
  },
  button_check_result_register: {
    backgroundColor: "#008000",
    margin: 5,
    color: "#008000",
  },
  table: {
    marginTop: 40,
  },
  head: {
    height: 40,
    backgroundColor: "#ff9966",
  },
  body: {
    backgroundColor: "#fff",
  },
  text: {
    margin: 6,
    textAlign: "center",
  },
  semesterText: {
    marginBottom: 5,
  },
  modal: {
    backgroundColor: "#fff",
    padding: 10,
    margin: 10,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 2,
  },
  dropdown: {
    margin: 16,
    height: 50,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  icon: {
    marginRight: 5,
  },
  item: {
    padding: 17,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textItem: {
    flex: 1,
    fontSize: 16,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
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
  inputContainer: {
    flexDirection: "column", // Stack TextInput and note vertically
    alignItems: "center",
  },
  noteContainer: {
    marginTop: 2, // Adds a small margin between the input and the note
  },
  noteText: {
    fontSize: 10, // Smaller text for the note
    color: "gray", // Optional: Use gray to differentiate the note text
  },
  bellIconContainer: {
    position: "relative",
  },
  bellIcon: {
    marginRight: -10,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "red",
    color: "white",
  },
  notificationItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  notificationText: {
    fontSize: 16,
  },
  notificationTime: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
});
