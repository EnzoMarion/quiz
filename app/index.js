import { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, Button, StyleSheet, Dimensions } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import NeonText from "../components/NeonText";
import { theme } from "../styles/theme";

const { width, height } = Dimensions.get("window");

export default function Home() {
    const [playerName, setPlayerName] = useState("");
    const [numQuestions, setNumQuestions] = useState("4");
    const [questions, setQuestions] = useState([]);
    const [fontLoaded, setFontLoaded] = useState(false);
    const router = useRouter();

    const loadQuestions = async () => {
        try {
            const savedQuestions = await AsyncStorage.getItem("questions");
            if (savedQuestions) {
                setQuestions(JSON.parse(savedQuestions));
            } else {
                setQuestions([]);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des questions:", error);
            setQuestions([]);
        }
    };

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
            await loadQuestions();
        }
        loadResources();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadQuestions();
        }, [])
    );

    const startQuiz = () => {
        const numQ = parseInt(numQuestions, 10);
        if (!playerName.trim() || questions.length < numQ || numQ < 1) {
            alert(`Ajoute au moins ${numQ} questions et un nom valide !`);
            return;
        }
        router.push({
            pathname: "/quiz",
            params: { playerName, questions: JSON.stringify(questions), numQuestions },
        });
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
                <NeonText style={styles.title}>Bienvenue sur Quiz App</NeonText>
                <TextInput
                    style={styles.input}
                    placeholder="Nom du joueur"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={playerName}
                    onChangeText={setPlayerName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Nombre de questions (ex: 4, 8, 10...)"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={numQuestions}
                    onChangeText={setNumQuestions}
                    keyboardType="numeric"
                />
                <Button
                    title="Commencer la partie"
                    onPress={startQuiz}
                    color={theme.colors.electricBlue}
                />
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
        justifyContent: "center",
    },
    title: {
        fontSize: Math.min(width * 0.04, 20),
        textAlign: "center",
        marginBottom: height * 0.02,
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
        backgroundColor: theme.colors.darkGray,
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