import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "../styles/theme";

const { width, height } = Dimensions.get("window");

export default function QuestionForm({ onSave }) {
    const [question, setQuestion] = useState("");
    const [type, setType] = useState("qcm");
    const [numOptions, setNumOptions] = useState("4");
    const [options, setOptions] = useState(["", "", "", ""]);
    const [correctIndex, setCorrectIndex] = useState(0);

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const updateOptions = (num) => {
        const numInt = parseInt(num, 10);
        if (isNaN(numInt) || numInt ) {
            return;
        }
        const newOptions = Array.from({ length: numInt }, (_, i) => options[i] || "");
        setOptions(newOptions);
        setNumOptions(num);
        if (correctIndex >= numInt) setCorrectIndex(0);
    };

    const addQuestion = async () => {
        if (!question.trim()) return;

        let finalOptions = type === "vraiFaux" ? ["Vrai", "Faux"] : options;
        let finalCorrectIndex = type === "vraiFaux" ? (correctIndex % 2) : correctIndex;

        if (type === "qcm" && finalOptions.some((opt) => !opt.trim())) return;

        const newQuestion = { question, type, options: finalOptions, correctIndex: finalCorrectIndex };
        const savedQuestions = await AsyncStorage.getItem("questions");
        const questions = savedQuestions ? JSON.parse(savedQuestions) : [];
        questions.push(newQuestion);
        await AsyncStorage.setItem("questions", JSON.stringify(questions));
        onSave(questions);
        setQuestion("");
        setType("qcm");
        setNumOptions("4");
        setOptions(["", "", "", ""]);
        setCorrectIndex(0);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Ajouter une Question</Text>
            <TextInput
                style={styles.input}
                placeholder="Écrire la question..."
                placeholderTextColor={theme.colors.textSecondary}
                value={question}
                onChangeText={setQuestion}
            />
            <View style={styles.buttonGroup}>
                <Text style={styles.label}>Type :</Text>
                <Button
                    title="QCM"
                    onPress={() => setType("qcm")}
                    color={type === "qcm" ? theme.colors.electricBlue : theme.colors.textSecondary}
                />
                <Button
                    title="Vrai/Faux"
                    onPress={() => setType("vraiFaux")}
                    color={type === "vraiFaux" ? theme.colors.electricBlue : theme.colors.textSecondary}
                />
            </View>
            {type === "qcm" && (
                <TextInput
                    style={styles.input}
                    placeholder="Nombre d'options (ex: 4, 8, 13...)"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={numOptions}
                    onChangeText={updateOptions}
                    keyboardType="numeric"
                />
            )}
            {(type === "qcm" ? options : ["Vrai", "Faux"]).map((opt, index) => (
                <View key={index} style={styles.optionRow}>
                    {type === "qcm" ? (
                        <TextInput
                            style={styles.optionInput}
                            placeholder={`Option ${index + 1}`}
                            placeholderTextColor={theme.colors.textSecondary}
                            value={opt}
                            onChangeText={(value) => handleOptionChange(index, value)}
                        />
                    ) : (
                        <Text style={styles.optionText}>{opt}</Text>
                    )}
                    <Button
                        title="✓"
                        onPress={() => setCorrectIndex(index)}
                        color={correctIndex === index ? theme.colors.neonOrange : theme.colors.textSecondary}
                    />
                </View>
            ))}
            <Button title="Ajouter" onPress={addQuestion} color={theme.colors.electricBlue} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: width * 0.02,
        backgroundColor: theme.colors.darkGray,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: theme.colors.neonOrange,
        marginBottom: height * 0.015,
    },
    title: {
        fontSize: Math.min(width * 0.035, 16),
        fontFamily: theme.fonts.title || "monospace",
        color: theme.colors.electricBlue,
        marginBottom: height * 0.015,
    },
    input: {
        borderWidth: 1,
        borderColor: theme.colors.neonOrange,
        padding: width * 0.02,
        marginVertical: height * 0.01,
        color: theme.colors.textPrimary,
        fontFamily: theme.fonts.body || "monospace",
        fontSize: Math.min(width * 0.035, 14),
        borderRadius: 5,
        backgroundColor: "#444",
    },
    buttonGroup: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: height * 0.015,
    },
    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: height * 0.01,
    },
    optionInput: {
        borderWidth: 1,
        borderColor: theme.colors.neonOrange,
        flex: 1,
        padding: width * 0.02,
        color: theme.colors.textPrimary,
        fontFamily: theme.fonts.body || "monospace",
        fontSize: Math.min(width * 0.035, 14),
        borderRadius: 5,
        backgroundColor: "#444",
    },
    optionText: {
        flex: 1,
        padding: width * 0.02,
        color: theme.colors.textPrimary,
        fontFamily: theme.fonts.body || "monospace",
        fontSize: Math.min(width * 0.035, 14),
    },
    label: {
        color: theme.colors.textPrimary,
        fontFamily: theme.fonts.body || "monospace",
        fontSize: Math.min(width * 0.035, 14),
        marginRight: width * 0.02,
    },
});