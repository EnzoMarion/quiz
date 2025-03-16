import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Text } from "react-native";
import Header from "../components/Header";
import { theme } from "../styles/theme";
import { QuestionsProvider } from "../context/QuestionsContext";

export default function Layout() {
    return (
        <QuestionsProvider>
            <Header />
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: theme.colors.electricBlue,
                    tabBarInactiveTintColor: theme.colors.textPrimary,
                    tabBarStyle: {
                        backgroundColor: "#0d1b2a",
                        borderTopColor: theme.colors.neonOrange,
                        borderTopWidth: 2,
                        height: 55,
                        paddingBottom: 8,
                        paddingTop: 5,
                    },
                    headerShown: false,
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "Accueil",
                        tabBarIcon: ({ color, size }) => (
                            <MaterialIcons name="home" size={size} color={color} />
                        ),
                        tabBarLabel: ({ focused }) => (
                            <Text
                                style={{
                                    color: focused ? theme.colors.electricBlue : theme.colors.textPrimary,
                                    fontFamily: theme.fonts.body || "monospace",
                                    fontSize: 12,
                                    fontWeight: "600",
                                    textAlign: "center",
                                }}
                            >
                                Accueil
                            </Text>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="questions"
                    options={{
                        title: "Gérer",
                        tabBarIcon: ({ color, size }) => (
                            <MaterialIcons name="question-answer" size={size} color={color} />
                        ),
                        tabBarLabel: ({ focused }) => (
                            <Text
                                style={{
                                    color: focused ? theme.colors.electricBlue : theme.colors.textPrimary,
                                    fontFamily: theme.fonts.body || "monospace",
                                    fontSize: 12,
                                    fontWeight: "600",
                                    textAlign: "center",
                                }}
                            >
                                Gérer
                            </Text>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="scores"
                    options={{
                        title: "Scores",
                        tabBarIcon: ({ color, size }) => (
                            <MaterialIcons name="leaderboard" size={size} color={color} />
                        ),
                        tabBarLabel: ({ focused }) => (
                            <Text
                                style={{
                                    color: focused ? theme.colors.electricBlue : theme.colors.textPrimary,
                                    fontFamily: theme.fonts.body || "monospace",
                                    fontSize: 12,
                                    fontWeight: "600",
                                    textAlign: "center",
                                }}
                            >
                                Scores
                            </Text>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="quiz"
                    options={{
                        href: null,
                    }}
                />
            </Tabs>
        </QuestionsProvider>
    );
}