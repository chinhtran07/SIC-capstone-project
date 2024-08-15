import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },

  infoBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
    height: 70,
    borderColor: "black",
    borderWidth: 1,
    padding: 2,
    margin: 15,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  column: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    height: "100%",
    width: 1,
    backgroundColor: "#ccc",
  },
  infoLabel: {
    fontSize: 14,
    color: "#555",
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 17,
    color: "#000",
    fontWeight: "700",
    marginTop: 10,
  },
});
