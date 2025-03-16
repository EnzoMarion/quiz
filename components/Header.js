import { View, Image, StyleSheet, Dimensions } from "react-native";

import logo from "../assets/images/logo.png";

const { width } = Dimensions.get("window");

export default function Header() {
    return (
        <View style={styles.header}>
            <Image
                source={logo}
                style={styles.logo}
                resizeMode="contain"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: "#0d1b2a",
        paddingVertical: 10,
        paddingHorizontal: 10,
        alignItems: "center",
        borderBottomWidth: 2,
        borderBottomColor: "#ff9500",
        boxShadow: "0px 1px 3px rgba(255, 149, 0, 0.5)",
        elevation: 3,
    },
    logo: {
        width: width * 0.35,
        height: width * 0.12,
        maxWidth: 250,
        maxHeight: 80,
    },
});