/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";

const Scrambler = () => {
  const [sentences, setSentences] = useState({});
  const [guessedSentences, setGuessedSentences] = useState([]);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [activeLetterIndex, setActiveLetterIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [originalGuessedLetters, setOriginalGuessedLetters] = useState([]);

  const inputRefs = useRef([]);

  const fetchUserData = () => {
    fetch("https://api.hatchways.io/assessment/sentences/1")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setSentences(data);
        const wordsArray = data.data.sentence.split(" ");
        setGuessedSentences(wordsArray);
        setOriginalGuessedLetters(wordsArray.map((word) => word.split("")));
      });
  };

  const handleInput = (event) => {
    const { key } = event;

    if (key === " ") {
      setActiveLetterIndex(0);
      setActiveWordIndex((prevIndex) => prevIndex + 1);
    } else if (
      activeWordIndex < guessedSentences.length &&
      activeLetterIndex < guessedSentences[activeWordIndex].length
    ) {
      setGuessedSentences((prevGuessed) =>
        prevGuessed.map((word, index) =>
          index === activeWordIndex
            ? word.substring(0, activeLetterIndex) +
              key +
              word.substring(activeLetterIndex + 1)
            : word
        )
      );
      setActiveLetterIndex((prevIndex) => prevIndex + 1);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleInput);
    return () => {
      window.removeEventListener("keydown", handleInput);
    };
  }, [activeWordIndex, activeLetterIndex]);

  // Function to scramble a word
  const scrambleWord = (word) => {
    if (word.length <= 2) {
      return word;
    }

    const firstLetter = word[0];
    const lastLetter = word[word.length - 1];
    const middleLetters = word.substring(1, word.length - 1);

    const scrambledMiddle = middleLetters
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");

    return firstLetter + scrambledMiddle + lastLetter;
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <div>
      {sentences.data && (
        <div>
          <p>
            {sentences.data.sentence
              .split(" ")
              .map((word) => scrambleWord(word))
              .join(" ")}
          </p>
          <p>Guess the sentence! Start typing.</p>
          <p>The yellow blocks are meant for spaces.</p>
          <p>Score: 0</p>

          <div>
            {guessedSentences.map((guessedWord, wordIndex) => (
              <div style={{ display: "flex" }} key={wordIndex}>
                {guessedWord.split("").map((letter, letterIndex) => {
                  const originalLetter =
                    originalGuessedLetters[wordIndex][letterIndex];
                  const prevOriginalLetter =
                    wordIndex > 0
                      ? originalGuessedLetters[wordIndex][letterIndex]
                      : "";
                  return (
                    <div
                      key={letterIndex}
                      style={{
                        width: "50%",
                        height: "30px",
                        backgroundColor:
                          inputValue.toLowerCase() ===
                          originalLetter.toLowerCase()
                            ? "green" // Set background color to green if the input matches the letter
                            : "grey",

                        marginRight: "5px",
                        marginBottom: "1em",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <input
                        ref={(el) => (inputRefs.current[wordIndex] = el)} // Assign ref to input
                        type="text"
                        disabled={
                          inputValue.toLowerCase() !==
                            prevOriginalLetter.toLowerCase() &&
                          (wordIndex === 0 ||
                            inputValue.toLowerCase() !==
                              prevOriginalLetter.toLowerCase())
                        }
                        value={inputValue}
                        maxLength={1}
                        onChange={(event) => {
                          const inputValue = event.target.value;
                          setInputValue(inputValue);
                          if (inputValue.length > 0) {
                            setGuessedSentences((prevGuessed) =>
                              prevGuessed.map((word, index) =>
                                index === wordIndex
                                  ? word.substring(0, letterIndex) +
                                    inputValue +
                                    word.substring(letterIndex + 1)
                                  : word
                              )
                            );

                            // Move focus to the next input
                            if (inputRefs.current[wordIndex + 1]) {
                              inputRefs.current[wordIndex + 1].focus();
                            }
                          }
                        }}
                        style={{
                          width: "100%",
                          height: "100%",
                          backgroundColor: "transparent",
                          border: "none",
                          textAlign: "center",
                          fontSize: "inherit",
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Scrambler;
