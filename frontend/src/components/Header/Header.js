import React, { useState } from "react";
import { SafeAreaView, View, StyleSheet, Text } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { Dropdown } from "react-native-element-dropdown";

export default function Header() {
  const [selectedValue, setSelectedValue] = useState(null);

  const data = [
    { label: "Vườn 1", value: "garden1" },
    { label: "Vườn 2", value: "garnden2" },
    { label: "Vườn 3", value: "garden3" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Feather name="menu" size={24} color="black" />
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          iconStyle={styles.iconStyle}
          data={data}
          labelField="label"
          valueField="value"
          placeholder="Select a garden here"
          value={selectedValue}
          onChange={(item) => setSelectedValue(item.value)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  dropdown: {
    height: 40,
    width: 250,
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    marginLeft: 10,
  },
  placeholderStyle: {
    fontSize: 16,
    color: "gray",
  },
  selectedTextStyle: {
    fontSize: 16,
    color: "#000",
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
});
