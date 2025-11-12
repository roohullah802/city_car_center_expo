import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/Ionicons";
import { useUploadDocumentsMutation } from "@/redux.toolkit/rtk/apis";
import { showToast } from "@/folder/toastService";
import { router } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';


type DocKey = "cnicFront" | "cnicBack" | "drivingLicence" | "extraDocuments";

const DOCUMENTS: { label: string; key: DocKey; required: boolean }[] = [
  { label: "CNIC Front", key: "cnicFront", required: true },
  { label: "CNIC Back", key: "cnicBack", required: true },
  { label: "Driving License", key: "drivingLicence", required: true },
  { label: "Additional Documents", key: "extraDocuments", required: false },
];

type DocsState = {
  cnicFront: string | null;
  cnicBack: string | null;
  drivingLicence: string | null;
  extraDocuments: string[];
};

const DocumentUploadScreen: React.FC = () => {
  const [docs, setDocs] = useState<DocsState>({
    cnicFront: null,
    cnicBack: null,
    drivingLicence: null,
    extraDocuments: [],
  });
  const insets = useSafeAreaInsets();

  const [uploadDocuments, { isLoading }] = useUploadDocumentsMutation();

  const pickDocument = useCallback(async (key: DocKey) => {
    const res = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      mediaTypes: ["images"],
      quality: 0.7,
    });

    if (!res.canceled) {
      const uri = res.assets[0].uri;
      setDocs((prev) => {
        if (key === "extraDocuments") {
          return { ...prev, extraDocuments: [...prev.extraDocuments, uri] };
        } else {
          return { ...prev, [key]: uri };
        }
      });
    }
  }, []);

  const canContinue = useMemo(
    () => docs.cnicFront && docs.cnicBack && docs.drivingLicence,
    [docs]
  );

  const handleSubmit = async () => {
    const formData = new FormData();

    if (docs.cnicFront) {
      formData.append("cnicFront", {
        uri: docs.cnicFront,
        type: "image/jpeg",
        name: "cnicFront.jpg",
      } as any);
    }
    if (docs.cnicBack) {
      formData.append("cnicBack", {
        uri: docs.cnicBack,
        type: "image/jpeg",
        name: "cnicBack.jpg",
      } as any);
    }
    if (docs.drivingLicence) {
      formData.append("drivingLicence", {
        uri: docs.drivingLicence,
        type: "image/jpeg",
        name: "drivingLicence.jpg",
      } as any);
    }
    docs.extraDocuments.forEach((uri, index) => {
      formData.append("extraDocuments", {
        uri,
        type: "image/jpeg",
        name: `extra-${index}.jpg`,
      } as any);
    });

    try {
      
      await uploadDocuments(formData).unwrap();
      showToast("Uploaded successfully");
      router.push("/screens/Setting/DocumentSubmittedScreen");
    } catch (e) {
      console.error("Upload failed", e);
      showToast("Oops! Upload documents failed!");
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, {paddingTop: insets.top + 20}]}>
      <Text style={styles.title}>Upload Required Documents</Text>
      <Text style={styles.subtitle}>
        Please upload your documents to verify your identity.
      </Text>

      {DOCUMENTS.map((doc) => (
        <View key={doc.key} style={styles.card}>
          <Text style={styles.label}>
            {doc.label} {doc.required && <Text style={{ color: "red" }}>*</Text>}
          </Text>

          {doc.key === "extraDocuments" ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {docs.extraDocuments.map((file, i) => (
                <View key={i} style={{ position: "relative" }}>
                  <Image source={{ uri: file }} style={styles.previewSmall} />
                  <TouchableOpacity
                    style={styles.removeSmallBtn}
                    onPress={() =>
                      setDocs((prev) => ({
                        ...prev,
                        extraDocuments: prev.extraDocuments.filter((_, index) => index !== i),
                      }))
                    }
                  >
                    <Icon name="close" size={17} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          ) : docs[doc.key] ? (
            <View>
              <Image source={{ uri: docs[doc.key]! }} style={styles.preview} />
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => setDocs((prev) => ({ ...prev, [doc.key]: null }))}
              >
                <Icon name="trash-outline" size={20} color="#ff4e4e" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.placeholder}>
              <Icon name="document-text-outline" size={40} color="#777" />
            </View>
          )}

          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={() => pickDocument(doc.key)}
          >
            <Icon name="cloud-upload-outline" size={22} color="#fff" />
            <Text style={styles.uploadText}>
              {doc.key === "extraDocuments" ? "Add File" : "Upload"}
            </Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        disabled={!canContinue || isLoading}
        onPress={handleSubmit}
        style={[styles.continueBtn, (!canContinue || isLoading) && { backgroundColor: "#ccc" }]}
      >
        <Text style={styles.continueText}>{isLoading ? "Uploading..." : "Continue"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default DocumentUploadScreen;

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 70 },
  title: { fontSize: 22, fontWeight: "bold", color: "#222" },
  subtitle: { fontSize: 14, marginTop: 8, marginBottom: 20, color: "#666" },
  card: { backgroundColor: "#fff", padding: 14, borderRadius: 12, marginBottom: 18, elevation: 2 },
  label: { fontSize: 15, fontWeight: "600", marginBottom: 10, color: "#333" },
  preview: { width: "100%", height: 160, borderRadius: 10, marginBottom: 10 },
  previewSmall: { width: 80, height: 80, borderRadius: 8, marginRight: 10, backgroundColor: "#eee" },
  removeSmallBtn: { position: "absolute", top: -6, right: -6, backgroundColor: "rgba(255,0,0,0.8)", borderRadius: 20, padding: 3 },
  placeholder: { width: "100%", height: 160, borderRadius: 10, backgroundColor: "#f0f0f0", justifyContent: "center", alignItems: "center", marginBottom: 10 },
  uploadBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#45B1E8", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, marginTop: 5 },
  uploadText: { color: "#fff", marginLeft: 8, fontSize: 14, fontWeight: "600" },
  removeBtn: { position: "absolute", top: 10, right: 10, backgroundColor: "#fff", padding: 6, borderRadius: 20 },
  continueBtn: { backgroundColor: "#45B1E8", paddingVertical: 14, borderRadius: 10, marginTop: 10 },
  continueText: { color: "#fff", textAlign: "center", fontSize: 16, fontWeight: "700" },
});
