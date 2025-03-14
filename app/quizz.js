import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Button } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Quiz() {
    console.log("Quiz page loaded"); // Log pour confirmer que la page est chargée
    const { playerName, questions: questionsStr } = useLocalSearchParams();
    const questions = JSON.parse(questionsStr);
    const router = useRouter();

    const [quizQuestions, setQuizQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [shuffledOptions, setShuffledOptions] = useState([]);
    const [shuffledCorrectIndex, setShuffledCorrectIndex] = useState(0);

    useEffect(() => {
        if (!questions || questions.length < 4) {
            alert("Erreur : Pas assez de questions pour jouer !");
            router.push("/");
            return;
        }
        const shuffled = [...questions].sort(() => 0.5 - Math.random()).slice(0, 4);
        setQuizQuestions(shuffled);
        shuffleOptions(shuffled[0]);
    }, []);

    const shuffleOptions = (question) => {
        const options = [...question.options];
        const correctIndex = question.correctIndex;
        const correctAnswer = options[correctIndex];

        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }

        const newCorrectIndex = options.indexOf(correctAnswer);
        setShuffledOptions(options);
        setShuffledCorrectIndex(newCorrectIndex);
    };

    const submitAnswer = () => {
        if (selectedOption === null) {
            alert("Sélectionne une réponse !");
            return;
        }
        if (selectedOption === shuffledCorrectIndex) {
            setScore(score + 1);
        }
        if (currentIndex + 1 < quizQuestions.length) {
            setCurrentIndex(currentIndex + 1);
            shuffleOptions(quizQuestions[currentIndex + 1]);
            setSelectedOption(null);
        } else {
            saveScore(playerName, score + (selectedOption === shuffledCorrectIndex ? 1 : 0));
            router.push("/");
        }
    };

    const saveScore = async (name, points) => {
        const newScore = { name, points };
        const savedScores = await AsyncStorage.getItem("scores");
        const currentScores = savedScores ? JSON.parse(savedScores) : [];
        currentScores.push(newScore);
        await AsyncStorage.setItem("scores", JSON.stringify(currentScores));
    };

    return (
        <View style={{ padding: 16, flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
                {quizQuestions[currentIndex]?.question}
            </Text>
            {shuffledOptions.map((opt, index) => (
                <TouchableOpacity
                    key={index}
                    style={{
                        padding: 10,
                        backgroundColor: selectedOption === index ? "#3498db" : "#ecf0f1",
                        marginVertical: 5,
                        borderRadius: 5,
                    }}
                    onPress={() => setSelectedOption(index)}
                >
                    <Text style={{ color: selectedOption === index ? "white" : "black" }}>{opt}</Text>
                </TouchableOpacity>
            ))}
            <Button title="Valider" onPress={submitAnswer} />
        </View>
    );
}