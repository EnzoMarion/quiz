import { useState, useEffect, useContext } from "react";
import { View, Text, TouchableOpacity, Button, StyleSheet, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../styles/theme";
import { QuestionsContext } from "../context/QuestionsContext";

const { width, height } = Dimensions.get("window");

export default function Quiz() {
    const { playerName, numQuestions } = useLocalSearchParams();
    const { questions } = useContext(QuestionsContext);
    const totalQuestions = parseInt(numQuestions, 10);
    const router = useRouter();

    const [quizQuestions, setQuizQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [shuffledOptions, setShuffledOptions] = useState([]);
    const [shuffledCorrectIndex, setShuffledCorrectIndex] = useState(0);
    const [fontLoaded, setFontLoaded] = useState(false);

    useEffect(() => {
        setScore(0);
        setCurrentIndex(0);
        setSelectedOption(null);
        setQuizQuestions([]);
        setShuffledOptions([]);
        setShuffledCorrectIndex(0);

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

            if (!questions || questions.length < totalQuestions) {
                alert("Erreur : Pas assez de questions pour jouer !");
                router.push("/");
                return;
            }
            const shuffled = [...questions].sort(() => 0.5 - Math.random()).slice(0, totalQuestions);
            setQuizQuestions(shuffled);
            shuffleOptions(shuffled[0]);
        }
        loadResources();
    }, [playerName, questions, numQuestions]);

    const shuffleOptions = (question) => {
        const options = [...question.options];
        const correctIndex = question.correctIndex;
        const correctAnswer = options[correctIndex];

        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]]; // Correction de la syntaxe de déstructuration
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
        const finalScore = score + (selectedOption === shuffledCorrectIndex ? 1 : 0);
        if (selectedOption === shuffledCorrectIndex) {
            setScore(finalScore);
        }
        if (currentIndex + 1 < quizQuestions.length) {
            setCurrentIndex(currentIndex + 1);
            shuffleOptions(quizQuestions[currentIndex + 1]);
            setSelectedOption(null);
        } else {
            saveScore(playerName, finalScore).then(() => {
                router.push({
                    pathname: "/scores",
                    params: {
                        newScore: finalScore,
                        totalQuestions: quizQuestions.length,
                        playerName,
                    },
                });
            });
        }
    };

    const saveScore = async (name, points) => {
        const newScore = { name, points, total: quizQuestions.length };
        const savedScores = await AsyncStorage.getItem("scores");
        let currentScores = savedScores ? JSON.parse(savedScores) : [];

        const scoreExists = currentScores.some(
            (score) => score.name === name && score.points === points && score.total === quizQuestions.length
        );
        if (!scoreExists) {
            currentScores.push(newScore);
            await AsyncStorage.setItem("scores", JSON.stringify(currentScores));
        }
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
            <View style={styles.container}>
                <Text style={styles.question}>
                    {quizQuestions[currentIndex]?.question}
                </Text>
                {shuffledOptions.map((opt, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.optionButton,
                            {
                                backgroundColor: selectedOption === index ? theme.colors.electricBlue : theme.colors.darkGray,
                            },
                        ]}
                        onPress={() => setSelectedOption(index)}
                    >
                        <Text
                            style={[
                                styles.optionText,
                                { color: selectedOption === index ? theme.colors.textPrimary : theme.colors.textSecondary },
                            ]}
                        >
                            {opt}
                        </Text>
                    </TouchableOpacity>
                ))}
                <Button title="Valider" onPress={submitAnswer} color={theme.colors.neonOrange} />
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: width * 0.03,
        paddingVertical: height * 0.02,
    },
    question: {
        color: "#fff",
        fontSize: Math.min(width * 0.06, 24),
        marginBottom: height * 0.02,
        fontFamily: theme.fonts.body || "monospace",
    },
    optionButton: {
        padding: width * 0.02,
        marginVertical: height * 0.005,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: theme.colors.neonOrange,
        boxShadow: "0px 0px 3px rgba(102, 217, 255, 0.3)",
        elevation: 2,
    },
    optionText: {
        fontFamily: theme.fonts.body || "monospace",
        fontSize: Math.min(width * 0.035, 14),
        textAlign: "center",
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