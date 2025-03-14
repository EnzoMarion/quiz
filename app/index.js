import { useState, useEffect } from "react";
import { ScrollView, View, Text, TextInput, Button, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import QuestionForm from "./components/QuestionForm";
import Scoreboard from "./components/Scoreboard";

export default function Home() {
    const [questions, setQuestions] = useState([]);
    const [scores, setScores] = useState([]);
    const [playerName, setPlayerName] = useState("");
    const router = useRouter();

    useEffect(() => {
        const loadQuestions = async () => {
            const savedQuestions = await AsyncStorage.getItem("questions");
            if (savedQuestions) setQuestions(JSON.parse(savedQuestions));
        };
        loadQuestions();

        const loadScores = async () => {
            const savedScores = await AsyncStorage.getItem("scores");
            if (savedScores) setScores(JSON.parse(savedScores));
        };
        loadScores();
    }, []);

    const addQuestion = (newQuestions) => {
        setQuestions(newQuestions);
    };

    const addScore = async (name, points) => {
        const newScore = { name, points };
        const savedScores = await AsyncStorage.getItem("scores");
        const currentScores = savedScores ? JSON.parse(savedScores) : [];
        currentScores.push(newScore);
        await AsyncStorage.setItem("scores", JSON.stringify(currentScores));
        setScores(currentScores);
    };

    const deleteQuestion = async (index) => {
        const updatedQuestions = questions.filter((_, i) => i !== index);
        await AsyncStorage.setItem("questions", JSON.stringify(updatedQuestions));
        setQuestions(updatedQuestions);
    };

    const startQuiz = () => {
        if (!playerName.trim() || questions.length < 4) {
            Alert.alert("Erreur", "Ajoute au moins 4 questions et un nom valide !");
            return;
        }
        console.log("Navigating to /quiz with:", { playerName, questions }); // Log pour déboguer
        router.push({
            pathname: "/quiz",
            params: { playerName, questions: JSON.stringify(questions) },
        });
    };

    return (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 }}>
                Quiz App
            </Text>
            <QuestionForm onSave={addQuestion} />
            <View style={{ padding: 16, borderWidth: 1, borderRadius: 10, marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>Nouvelle Partie</Text>
                <TextInput
                    style={{ borderWidth: 1, padding: 8, marginVertical: 8 }}
                    placeholder="Nom du joueur"
                    value={playerName}
                    onChangeText={setPlayerName}
                />
                <Button title="Commencer" onPress={startQuiz} />
            </View>
            <Scoreboard scores={scores} setScores={setScores} />

            <View style={{ padding: 16, borderWidth: 1, borderRadius: 10, marginTop: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>Questions Créées</Text>
                {questions.length === 0 ? (
                    <Text style={{ paddingVertical: 5 }}>Aucune question créée.</Text>
                ) : (
                    questions.map((q, index) => (
                        <View key={index} style={{ marginVertical: 5 }}>
                            <Text style={{ fontWeight: "bold" }}>{q.question}</Text>
                            <Text>Type: {q.type === "vraiFaux" ? "Vrai/Faux" : "QCM"}</Text>
                            <Text>Options: {q.options.join(", ")}</Text>
                            <Text>Bonne réponse: {q.options[q.correctIndex]}</Text>
                            <Button title="Supprimer" onPress={() => deleteQuestion(index)} color="red" />
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}