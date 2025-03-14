import { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
        if (isNaN(numInt) || numInt < 2) {
            alert("Veuillez entrer un nombre valide supérieur ou égal à 2 !");
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
        <View style={{ padding: 16, borderWidth: 1, borderRadius: 10, marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Ajouter une Question</Text>
            <TextInput
                style={{ borderWidth: 1, padding: 8, marginVertical: 8 }}
                placeholder="Écrire la question..."
                value={question}
                onChangeText={setQuestion}
            />
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text>Type :</Text>
                <Button title="QCM" onPress={() => setType("qcm")} color={type === "qcm" ? "blue" : "gray"} />
                <Button title="Vrai/Faux" onPress={() => setType("vraiFaux")} color={type === "vraiFaux" ? "blue" : "gray"} />
            </View>
            {type === "qcm" && (
                <View>
                    <TextInput
                        style={{ borderWidth: 1, padding: 8, marginVertical: 8 }}
                        placeholder="Nombre d'options (ex: 4, 8, 13...)"
                        value={numOptions}
                        onChangeText={updateOptions}
                        keyboardType="numeric"
                    />
                </View>
            )}
            {(type === "qcm" ? options : ["Vrai", "Faux"]).map((opt, index) => (
                <View key={index} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                    {type === "qcm" ? (
                        <TextInput
                            style={{ borderWidth: 1, flex: 1, padding: 8 }}
                            placeholder={`Option ${index + 1}`}
                            value={opt}
                            onChangeText={(value) => handleOptionChange(index, value)}
                        />
                    ) : (
                        <Text style={{ flex: 1, padding: 8 }}>{opt}</Text>
                    )}
                    <Button
                        title="✓"
                        onPress={() => setCorrectIndex(index)}
                        color={correctIndex === index ? "green" : "gray"}
                    />
                </View>
            ))}
            <Button title="Ajouter" onPress={addQuestion} />
        </View>
    );
}