import { View, Text, Button, StyleSheet, Dimensions } from "react-native";
import { theme } from "../styles/theme";

const { width, height } = Dimensions.get("window");

export default function Scoreboard({ scores, onDelete }) {
    return (
        <View>
            {scores.map((score, index) => (
                <View key={index} style={styles.scoreCard}>
                    <Text style={styles.scoreText}>
                        {score.name}: {score.points}/{score.total} ({((score.points / score.total) * 100).toFixed(0)}%)
                    </Text>
                    <Button title="Supprimer" onPress={() => onDelete(index)} color={theme.colors.neonOrange} />
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    scoreCard: {
        padding: width * 0.02,
        backgroundColor: theme.colors.darkGray,
        borderRadius: 5,
        marginVertical: height * 0.005,
        borderWidth: 1,
        borderColor: theme.colors.neonOrange,
        boxShadow: "0px 0px 3px rgba(255, 149, 0, 0.3)",
        elevation: 2,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    scoreText: {
        color: theme.colors.textPrimary,
        fontFamily: theme.fonts.body || "monospace",
        fontSize: Math.min(width * 0.035, 14),
    },
});