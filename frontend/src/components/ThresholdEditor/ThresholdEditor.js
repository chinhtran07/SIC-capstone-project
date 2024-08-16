import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { apiClient, endpoints } from "../../config/apis";

export default function ThresholdEditor() {
  const [temperature, setTemperature] = useState();
  const [humidity, setHumidity] = useState();
  const [soilMoisture, setSoilMoisture] = useState();

  const maxValues = {
    temperature: 50,
    humidity: 100,
    soilMoisture: 100,
  };

  const minValues = {
    temperature: 10,
    humidity: 0,
    soilMoisture: 0,
  };

  useEffect(() => {
    const getThreshold = async () => {
      try {
        let response = await apiClient.get(endpoints['get']);

        if (response.status === 200) {
          const data = response.data;
          setTemperature(data.temperature);
          setHumidity(data.humidity);
          setSoilMoisture(data.soilMoisture);
          console.log(data);
        }

      } catch (error) {
        console.log(error);
      }
    }
    getThreshold(); 
  }, [])

  const validateAndSubmit = () => {
    if (temperature < minValues.temperature || temperature > maxValues.temperature) {
      Alert.alert("Invalid Input", `Temperature must be between ${minValues.temperature} and ${maxValues.temperature}`);
      return;
    }
    if (humidity < minValues.humidity || humidity > maxValues.humidity) {
      Alert.alert("Invalid Input", `Humidity must be between ${minValues.humidity} and ${maxValues.humidity}`);
      return;
    }
    if (soilMoisture < minValues.soilMoisture || soilMoisture > maxValues.soilMoisture) {
      Alert.alert("Invalid Input", `Soil Moisture must be between ${minValues.soilMoisture} and ${maxValues.soilMoisture}`);
      return;
    }

    handleUpdateThreshold();
  };

  const handleIncrease = (type) => {
    if (type === "temperature" && temperature < maxValues.temperature) {
      setTemperature(temperature + 1);
    } else if (type === "humidity" && humidity < maxValues.humidity) {
      setHumidity(humidity + 1);
    } else if (type === "soilMoisture" && soilMoisture < maxValues.soilMoisture) {
      setSoilMoisture(soilMoisture + 1);
    } else {
      Alert.alert("Warning", `Max value for ${type} reached`);
    }
  };

  const handleDecrease = (type) => {
    if (type === "temperature" && temperature > minValues.temperature) {
      setTemperature(temperature - 1);
    } else if (type === "humidity" && humidity > minValues.humidity) {
      setHumidity(humidity - 1);
    } else if (type === "soilMoisture" && soilMoisture > minValues.soilMoisture) {
      setSoilMoisture(soilMoisture - 1);
    } else {
      Alert.alert("Warning", `Min value for ${type} reached`);
    }
  };

  const handleUpdateThreshold = async () => {
    try {
      const data = {
        temperature,
        humidity,
        soilMoisture,
      };

      let response = await apiClient.put(endpoints['update'], data);

      if (response.status === 200) {
        const result = response.data;
        Alert.alert("Success", "Threshold updated successfully!");
        console.log("Updated Threshold:", result);
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Failed to update threshold");
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while updating threshold");
      console.error("Error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.thresholdBox}>
        <Text style={styles.title}>Chỉnh sửa ngưỡng:</Text>

        {/* Temperature Control */}
        <Text style={styles.label}>Nhiệt độ: {temperature}°C</Text>
        <View style={styles.controlRow}>
          <TouchableOpacity style={styles.controlButton} onPress={() => handleDecrease("temperature")}>
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={() => handleIncrease("temperature")}>
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Humidity Control */}
        <Text style={styles.label}>Độ ẩm: {humidity}%</Text>
        <View style={styles.controlRow}>
          <TouchableOpacity style={styles.controlButton} onPress={() => handleDecrease("humidity")}>
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={() => handleIncrease("humidity")}>
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Soil Moisture Control */}
        <Text style={styles.label}>Độ ẩm đất: {soilMoisture}%</Text>
        <View style={styles.controlRow}>
          <TouchableOpacity style={styles.controlButton} onPress={() => handleDecrease("soilMoisture")}>
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={() => handleIncrease("soilMoisture")}>
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={validateAndSubmit}>
          <Text style={styles.submitButtonText}>Cập nhật ngưỡng</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  thresholdBox: {
    width: "100%",
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  label: {
    fontSize: 16,
    marginVertical: 10,
  },
  controlRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  controlButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    width: 50,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "black",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
