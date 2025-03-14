import { View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Scoreboard({ scores, setScores }) {
    const winner = scores.length > 0 ? scores.reduce((max, curr) => (max.points > curr.points ? max : curr)) : null;

    return (
        <View style={{ padding: 16, borderWidth: 1, borderRadius: 10, marginTop: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Scores</Text>
            {scores.map((score, index) => (
                <Text key={index} style={{ paddingVertical: 5 }}>
                    {score.name}: {score.points} pts
                </Text>
            ))}
            {winner && <Text style={{ paddingVertical: 5, fontWeight: "bold" }}>Gagnant : {winner.name} ({winner.points} pts)</Text>}
        </View>
    );
}