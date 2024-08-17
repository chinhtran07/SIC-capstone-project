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

// Define the min and max values
const minValues = {
  temperature: 10,
  humidity: 0,
  soilMoisture: 0,
};

const maxValues = {
  temperature: 50,
  humidity: 100,
  soilMoisture: 100,
};

// Translate keys to Vietnamese
const translate = {
  humidity: 'Độ ẩm',
  temperature: 'Nhiệt độ',
  soilMoisture: 'Độ ẩm đất'
};

const ThresholdEditor = () => {
  const [thresholds, setThresholds] = useState({
    temperature: undefined,
    humidity: undefined,
    soilMoisture: undefined,
  });

  useEffect(() => {
    const fetchThresholds = async () => {
      try {
        const response = await apiClient.get(endpoints['get']);
        if (response.status === 200) {
          const data = response.data;
          setThresholds({
            humidity: data.humidity,
            temperature: data.temperature,
            soilMoisture: data.soilMoisture,
          });
        } else {
          console.error('Lấy ngưỡng không thành công', response.statusText);
        }
      } catch (error) {
        console.error('Lỗi khi lấy ngưỡng:', error);
      }
    };
    fetchThresholds();
  }, []);

  const updateThreshold = async (updatedThresholds) => {
    try {
      const response = await apiClient.put(endpoints['update'], updatedThresholds);
      if (response.status === 200) {
        Alert.alert("Thành công", "Ngưỡng đã được cập nhật thành công!");
      } else {
        Alert.alert("Lỗi", response.data.message || "Không thể cập nhật ngưỡng");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi cập nhật ngưỡng");
      console.error("Lỗi khi cập nhật ngưỡng:", error);
    }
  };

  const validateThresholds = () => {
    const errors = [];
    Object.keys(thresholds).forEach((key) => {
      if (thresholds[key] < minValues[key] || thresholds[key] > maxValues[key]) {
        errors.push(`${translate[key]} phải nằm trong khoảng từ ${minValues[key]} đến ${maxValues[key]}`);
      }
    });
    if (errors.length) {
      Alert.alert("Thông báo", errors.join('\n'));
      return false;
    }
    return true;
  };

  const handleIncrement = (type) => {
    setThresholds((prev) => {
      const newValue = Math.min(prev[type] + 1, maxValues[type]);
      return { ...prev, [type]: newValue };
    });
  };

  const handleDecrement = (type) => {
    setThresholds((prev) => {
      const newValue = Math.max(prev[type] - 1, minValues[type]);
      return { ...prev, [type]: newValue };
    });
  };

  const handleSubmit = () => {
    if (validateThresholds()) {
      updateThreshold(thresholds);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.thresholdBox}>
        <Text style={styles.title}>Chỉnh sửa ngưỡng:</Text>

        {Object.keys(thresholds).map((type) => (
          <View key={type} style={styles.controlContainer}>
            <View style={styles.controlRow}>
              <TouchableOpacity
                style={[styles.controlButton, styles.decrementButton]}
                onPress={() => handleDecrement(type)}
              >
                <Text style={styles.buttonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.label}>{`${translate[type]}: ${thresholds[type]}`}</Text>
              <TouchableOpacity
                style={[styles.controlButton, styles.incrementButton]}
                onPress={() => handleIncrement(type)}
              >
                <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Cập nhật ngưỡng</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  thresholdBox: {
    width: "100%",
    maxWidth: 400,
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    elevation: 3, // Adds a shadow effect on Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
    shadowOpacity: 0.1, // Shadow opacity for iOS
    shadowRadius: 4, // Shadow blur radius for iOS
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  label: {
    fontSize: 18,
    color: "#555",
  },
  controlContainer: {
    marginBottom: 20,
  },
  controlRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  controlButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 5,
    width: 50,
    alignItems: "center",
  },
  decrementButton: {
    backgroundColor: "#ff4d4d", // Red color for decrement
  },
  incrementButton: {
    backgroundColor: "#4caf50", // Green color for increment
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#333",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ThresholdEditor;
