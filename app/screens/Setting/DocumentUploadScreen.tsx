import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/Ionicons";

type DocItem = {
  label: string;
  key: string;         
  required: boolean;
};

const DOCUMENTS: DocItem[] = [
  { label: "CNIC Front", key: "cnicFront", required: true },
  { label: "CNIC Back", key: "cnicBack", required: true },
  { label: "Driving License", key: "license", required: true },
  { label: "Additional Document", key: "extraDoc", required: false },
];

const DocumentUploadScreen: React.FC = () => {
  const [docs, setDocs] = useState<Record<string, string | null>>({
    cnicFront: null,
    cnicBack: null,
    license: null,
    extraDoc: null,
  });

  const pickDocument = useCallback(async (key: string) => {
    const res = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
      mediaTypes: ['images'],
    });

    if (!res.canceled) {
      setDocs(prev => ({ ...prev, [key]: res.assets[0].uri }));
    }
  }, []);

  const canContinue = useMemo(
    () =>
      docs.cnicFront &&
      docs.cnicBack &&
      docs.license,
    [docs]
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Upload Required Documents</Text>
      <Text style={styles.subtitle}>
        Please upload the documents below to verify your identity.
      </Text>

      {DOCUMENTS.map(doc => (
        <View key={doc.key} style={styles.card}>
          <Text style={styles.label}>
            {doc.label} {doc.required && <Text style={{ color: "red" }}>*</Text>}
          </Text>

          {docs[doc.key] ? (
            <Image source={{ uri: docs[doc.key]! }} style={styles.preview} />
          ) : (
            <View style={styles.placeholder}>
              <Icon name="document-text-outline" size={40} color="#777" />
            </View>
          )}

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={() => pickDocument(doc.key)}
            >
              <Icon name="cloud-upload-outline" size={20} color="#fff" />
              <Text style={styles.uploadText}>
                {docs[doc.key] ? "Replace" : "Upload"}
              </Text>
            </TouchableOpacity>

            {docs[doc.key] && (
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => setDocs(prev => ({ ...prev, [doc.key]: null }))}
              >
                <Icon name="trash-outline" size={20} color="#ff4e4e" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}

      <TouchableOpacity
        disabled={!canContinue}
        style={[styles.continueBtn, !canContinue && { backgroundColor: "#ccc" }]}
      >
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default DocumentUploadScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 70,
    paddingTop: Platform.OS === 'android' ? 20 : 30
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    paddingTop:30
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 20,
    color: "#666",
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 18,
    elevation: 2,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  preview: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    marginBottom: 10,
  },
  placeholder: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#45B1E8",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  uploadText: {
    color: "#fff",
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
  },
  removeBtn: {
    padding: 10,
  },
  continueBtn: {
    backgroundColor: "#45B1E8",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  continueText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },
});
