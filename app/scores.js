import { useState, useEffect, useCallback } from "react";
import { ScrollView, View, Text, Button, StyleSheet, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import NeonText from "../components/NeonText";
import { theme } from "../styles/theme";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { useFocusEffect } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function Scores() {
    const [scores, setScores] = useState([]);
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
            loadScores();
        }
        loadResources();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadScores();
        }, [])
    );

    const loadScores = async () => {
        try {
            const savedScores = await AsyncStorage.getItem("scores");
            console.log("Saved scores from AsyncStorage:", savedScores);
            if (savedScores) {
                const parsedScores = JSON.parse(savedScores);
                console.log("Parsed scores:", parsedScores);
                setScores(parsedScores);
            } else {
                console.log("No scores found in AsyncStorage.");
                setScores([]);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des scores:", error);
            setScores([]);
        }
    };

    const printScoresToDocx = async () => {
        try {
            console.log("Scores to export:", scores);
            if (!scores || scores.length === 0) {
                alert("Aucun score à exporter !");
                return;
            }

            const doc = new Document({
                sections: [
                    {
                        properties: {},
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: "Test Export Scores",
                                        bold: true,
                                        size: 32,
                                    }),
                                ],
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: "Liste des Scores :",
                                        size: 24,
                                    }),
                                ],
                            }),
                            ...scores.map((score, index) => {
                                const scoreText = `${index + 1}. ${score.name} - Score: ${score.points}/${score.total} (${((score.points / score.total) * 100).toFixed(2)}%)`;
                                console.log("Adding score to document:", scoreText);
                                return new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: scoreText,
                                            size: 24,
                                        }),
                                    ],
                                });
                            }),
                        ],
                    },
                ],
            });

            console.log("Document created, generating blob...");
            const blob = await Packer.toBlob(doc);
            console.log("Blob generated:", blob);
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `quiz-scores-${new Date().toISOString().split("T")[0]}.docx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            console.log("Download initiated, showing success alert...");
        } catch (error) {
            console.error("Erreur lors de l'exportation des scores:", error);
            alert("Échec de l'exportation des scores. Détails : " + error.message);
        }
    };

    const refreshScores = () => {
        loadScores();
    };

    if (!fontLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Chargement...</Text>
            </View>
        );
    }

    return (
        <LinearGradient colors={["#0d1b2a", "#1a1a1a"]} style={styles.gradient}>
            <ScrollView contentContainerStyle={styles.container}>
                <NeonText style={styles.title}>Classement des Scores</NeonText>
                {scores.length === 0 ? (
                    <Text style={styles.text}>Aucun score enregistré.</Text>
                ) : (
                    scores
                        .sort((a, b) => b.points - a.points)
                        .map((score, index) => (
                            <View key={index} style={styles.scoreCard}>
                                <Text style={styles.text}>
                                    {index + 1}. {score.name} - {score.points}/{score.total} (
                                    {((score.points / score.total) * 100).toFixed(2)}%)
                                </Text>
                            </View>
                        ))
                )}
                <View style={styles.buttonContainer}>
                    <Button
                        title="Imprimer les scores (Word)"
                        onPress={printScoresToDocx}
                        color={theme.colors.neonOrange}
                    />
                    <Button
                        title="Rafraîchir"
                        onPress={refreshScores}
                        color={theme.colors.electricBlue}
                        style={styles.refreshButton}
                    />
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
    scoreCard: {
        padding: width * 0.02,
        backgroundColor: theme.colors.darkGray,
        borderRadius: 5,
        marginVertical: height * 0.005,
        borderWidth: 1,
        borderColor: theme.colors.neonOrange,
    },
    text: {
        color: theme.colors.textPrimary,
        fontFamily: theme.fonts.body || "monospace",
        fontSize: Math.min(width * 0.035, 14),
    },
    buttonContainer: {
        marginTop: height * 0.02,
        marginBottom: height * 0.02,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    refreshButton: {
        marginLeft: width * 0.02,
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