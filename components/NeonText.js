import { Text, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from "react-native-reanimated";
import { theme } from "../styles/theme";

export default function NeonText({ children, style }) {
    const opacity = useSharedValue(1);

    opacity.value = withRepeat(
        withTiming(0.5, { duration: 800 }),
        -1,
        true
    );

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            textShadowColor: theme.colors.electricBlue,
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 4 * opacity.value,
        };
    });

    return (
        <Animated.Text style={[styles.text, animatedStyle, style]}>
            {children}
        </Animated.Text>
    );
}

const styles = StyleSheet.create({
    text: {
        fontFamily: theme.fonts.title || "monospace",
        color: theme.colors.neonOrange,
    },
});