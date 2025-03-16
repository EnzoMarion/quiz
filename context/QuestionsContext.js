import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const QuestionsContext = createContext();

export const QuestionsProvider = ({ children }) => {
    const [questions, setQuestions] = useState([]);

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
        loadQuestions();
    }, []);

    return (
        <QuestionsContext.Provider value={{ questions, setQuestions, loadQuestions }}>
            {children}
        </QuestionsContext.Provider>
    );
};