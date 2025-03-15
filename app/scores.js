import { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, Dimensions } from "react-native";
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import NeonText from "../components/NeonText";
import Scoreboard from "../components/Scoreboard";
import { theme } from "../styles/theme";

const { width, height } = Dimensions.get("window");

export default function Scores() {
    const [scores, setScores] = useState([]);
    const [fontLoaded, setFontLoaded] = useState(false);
    const params = useLocalSearchParams();

    const loadScores = async () => {
        try {
            const savedScores = await AsyncStorage.getItem("scores");
            let currentScores = savedScores ? JSON.parse(savedScores) : [];

            const uniqueScores = [];
            const seen = new Set();
            for (let score of currentScores.reverse()) {
                const key = `${score.name}-${score.points}-${score.total}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueScores.unshift(score);
                }
            }

            setScores(uniqueScores);
        } catch (error) {
            console.error("Erreur lors du chargement des scores:", error);
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
            await loadScores();
        }
        loadResources();
    }, []);

    useEffect(() => {
        if (params.newScore && params.totalQuestions) {
            loadScores();
        }
    }, [params.newScore, params.totalQuestions]);

    const deleteScore = async (index) => {
        const updatedScores = scores.filter((_, i) => i !== index);
        await AsyncStorage.setItem("scores", JSON.stringify(updatedScores));
        setScores(updatedScores);
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
                <NeonText style={styles.title}>Scores</NeonText>
                <Button title="Rafraîchir" onPress={loadScores} color={theme.colors.electricBlue} style={styles.refreshButton} />
                {scores.length === 0 ? (
                    <Text style={styles.text}>Aucun score disponible.</Text>
                ) : (
                    <Scoreboard scores={scores} setScores={setScores} onDelete={deleteScore} />
                )}
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
    title: {
        fontSize: Math.min(width * 0.04, 20),
        textAlign: "center",
        marginBottom: height * 0.02,
    },
    refreshButton: {
        marginBottom: height * 0.015,
    },
    text: {
        color: theme.colors.textPrimary,
        fontFamily: theme.fonts.body || "monospace",
        fontSize: Math.min(width * 0.035, 14),
        textAlign: "center",
        paddingVertical: height * 0.015,
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