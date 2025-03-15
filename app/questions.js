import { useState, useEffect } from "react";
import { ScrollView, View, Text, TextInput, Button, Alert, StyleSheet, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import QuestionForm from "../components/QuestionForm";
import NeonText from "../components/NeonText";
import { theme } from "../styles/theme";

const { width, height } = Dimensions.get("window");

export default function Questions() {
    const [questions, setQuestions] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editQuestion, setEditQuestion] = useState("");
    const [editType, setEditType] = useState("qcm");
    const [editNumOptions, setEditNumOptions] = useState("4");
    const [editOptions, setEditOptions] = useState(["", "", "", ""]);
    const [editCorrectIndex, setEditCorrectIndex] = useState(0);
    const [fontLoaded, setFontLoaded] = useState(false);

    useEffect(() => {
        async function loadResources() {
            try {
                await Promise.race([
                    Font.loadAsync({
                        "SpaceMono-Regular": require("../assets/fonts/SpaceMono-Regular.ttf"),
                        "Orbitron-Bold": require("../assets/fonts/Orbitron-Bold.ttf"),
                    }),
                    new Promise((resolve) => setTimeout(resolve, 5000)),
                ]);
                setFontLoaded(true);
            } catch (error) {
                console.error("Erreur lors du chargement des polices:", error);
                setFontLoaded(true);
            }

            const loadQuestions = async () => {
                try {
                    const savedQuestions = await AsyncStorage.getItem("questions");
                    if (savedQuestions) setQuestions(JSON.parse(savedQuestions));
                } catch (error) {
                    console.error("Erreur lors du chargement des questions:", error);
                }
            };
            loadQuestions();
        }
        loadResources();
    }, []);

    const addQuestion = (newQuestions) => {
        setQuestions(newQuestions);
    };

    const deleteQuestion = async (index) => {
        const updatedQuestions = questions.filter((_, i) => i !== index);
        await AsyncStorage.setItem("questions", JSON.stringify(updatedQuestions));
        setQuestions(updatedQuestions);
    };

    const startEditing = (index) => {
        const q = questions[index];
        setEditingIndex(index);
        setEditQuestion(q.question);
        setEditType(q.type);
        setEditNumOptions(q.options.length.toString());
        setEditOptions([...q.options]);
        setEditCorrectIndex(q.correctIndex);
    };

    const handleEditOptionChange = (index, value) => {
        const newOptions = [...editOptions];
        newOptions[index] = value;
        setEditOptions(newOptions);
    };

    const updateEditOptions = (num) => {
        const numInt = parseInt(num, 10);
        if (isNaN(numInt) || numInt < 2) {
            Alert.alert("Erreur", "Veuillez entrer un nombre valide supérieur ou égal à 2 !");
            return;
        }
        const newOptions = Array.from({ length: numInt }, (_, i) => editOptions[i] || "");
        setEditOptions(newOptions);
        setEditNumOptions(num);
        if (editCorrectIndex >= numInt) setEditCorrectIndex(0);
    };

    const saveEdit = async () => {
        if (!editQuestion.trim()) {
            Alert.alert("Erreur", "La question ne peut pas être vide !");
            return;
        }

        let finalOptions = editType === "vraiFaux" ? ["Vrai", "Faux"] : editOptions;
        let finalCorrectIndex = editType === "vraiFaux" ? (editCorrectIndex % 2) : editCorrectIndex;

        if (editType === "qcm" && finalOptions.some((opt) => !opt.trim())) {
            Alert.alert("Erreur", "Toutes les options doivent être remplies !");
            return;
        }

        const updatedQuestions = [...questions];
        updatedQuestions[editingIndex] = {
            question: editQuestion,
            type: editType,
            options: finalOptions,
            correctIndex: finalCorrectIndex,
        };
        await AsyncStorage.setItem("questions", JSON.stringify(updatedQuestions));
        setQuestions(updatedQuestions);
        setEditingIndex(null);
    };

    const cancelEdit = () => {
        setEditingIndex(null);
    };

    if (!fontLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Chargement...</Text>
            </View>
        );
    }

    return (
        <LinearGradient
            colors={["#0d1b2a", "#1a1a1a"]}
            style={styles.gradient}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <NeonText style={styles.title}>Gérer le Questionnaire</NeonText>
                <QuestionForm onSave={addQuestion} />
                <View style={styles.questionsContainer}>
                    <Text style={styles.subtitle}>Questions Créées</Text>
                    {questions.length === 0 ? (
                        <Text style={styles.text}>Aucune question créée.</Text>
                    ) : (
                        questions.map((q, index) => (
                            <View key={index} style={styles.questionCard}>
                                {editingIndex === index ? (
                                    <View style={styles.editContainer}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Écrire la question..."
                                            placeholderTextColor={theme.colors.textSecondary}
                                            value={editQuestion}
                                            onChangeText={setEditQuestion}
                                        />
                                        <View style={styles.buttonGroup}>
                                            <Text style={styles.label}>Type :</Text>
                                            <Button
                                                title="QCM"
                                                onPress={() => setEditType("qcm")}
                                                color={editType === "qcm" ? theme.colors.electricBlue : theme.colors.textSecondary}
                                            />
                                            <Button
                                                title="Vrai/Faux"
                                                onPress={() => setEditType("vraiFaux")}
                                                color={editType === "vraiFaux" ? theme.colors.electricBlue : theme.colors.textSecondary}
                                            />
                                        </View>
                                        {editType === "qcm" && (
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Nombre d'options (ex: 4, 8, 13...)"
                                                placeholderTextColor={theme.colors.textSecondary}
                                                value={editNumOptions}
                                                onChangeText={updateEditOptions}
                                                keyboardType="numeric"
                                            />
                                        )}
                                        {(editType === "qcm" ? editOptions : ["Vrai", "Faux"]).map((opt, idx) => (
                                            <View key={idx} style={styles.optionRow}>
                                                {editType === "qcm" ? (
                                                    <TextInput
                                                        style={styles.optionInput}
                                                        placeholder={`Option ${idx + 1}`}
                                                        placeholderTextColor={theme.colors.textSecondary}
                                                        value={opt}
                                                        onChangeText={(value) => handleEditOptionChange(idx, value)}
                                                    />
                                                ) : (
                                                    <Text style={styles.optionText}>{opt}</Text>
                                                )}
                                                <Button
                                                    title="✓"
                                                    onPress={() => setEditCorrectIndex(idx)}
                                                    color={editCorrectIndex === idx ? theme.colors.neonOrange : theme.colors.textSecondary}
                                                />
                                            </View>
                                        ))}
                                        <View style={styles.buttonGroup}>
                                            <Button title="Enregistrer" onPress={saveEdit} color={theme.colors.electricBlue} />
                                            <Button title="Annuler" onPress={cancelEdit} color={theme.colors.textSecondary} />
                                        </View>
                                    </View>
                                ) : (
                                    <>
                                        <Text style={styles.questionText}>{q.question}</Text>
                                        <Text style={styles.text}>Type: {q.type === "vraiFaux" ? "Vrai/Faux" : "QCM"}</Text>
                                        <Text style={styles.text}>Options: {q.options.join(", ")}</Text>
                                        <Text style={styles.text}>Bonne réponse: {q.options[q.correctIndex]}</Text>
                                        <View style={styles.buttonGroup}>
                                            <Button title="Modifier" onPress={() => startEditing(index)} color={theme.colors.electricBlue} />
                                            <Button title="Supprimer" onPress={() => deleteQuestion(index)} color={theme.colors.neonOrange} />
                                        </View>
                                    </>
                                )}
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flexGrow: 1,
        paddingHorizontal: width * 0.03,
        paddingVertical: height * 0.02,
    },
    title: {
        fontSize: Math.min(width * 0.04, 20),
        textAlign: "center",
        marginBottom: height * 0.02,
    },
    subtitle: {
        fontSize: Math.min(width * 0.035, 16),
        fontFamily: theme.fonts.title || "monospace",
        color: theme.colors.electricBlue,
        marginBottom: height * 0.015,
    },
    questionsContainer: {
        padding: width * 0.02,
        backgroundColor: theme.colors.darkGray,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: theme.colors.neonOrange,
    },
    questionCard: {
        padding: width * 0.02,
        backgroundColor: "#1a1a1a",
        borderRadius: 5,
        marginVertical: height * 0.005,
        borderWidth: 1,
        borderColor: theme.colors.neonOrange,
        boxShadow: "0px 0px 3px rgba(255, 149, 0, 0.3)",
        elevation: 2,
    },
    editContainer: {
        padding: width * 0.02,
        backgroundColor: "#222",
        borderRadius: 5,
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
    buttonGroup: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: height * 0.015,
    },
    text: {
        color: theme.colors.textPrimary,
        fontFamily: theme.fonts.body || "monospace",
        fontSize: Math.min(width * 0.035, 14),
    },
    questionText: {
        color: theme.colors.textPrimary,
        fontFamily: theme.fonts.body || "monospace",
        fontSize: Math.min(width * 0.035, 14),
        marginBottom: height * 0.01,
    },
    label: {
        color: theme.colors.textPrimary,
        fontFamily: theme.fonts.body || "monospace",
        fontSize: Math.min(width * 0.035, 14),
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: "#0d1b2a",
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        color: theme.colors.textPrimary,
        fontSize: 16,
        fontFamily: "monospace",
    },
});