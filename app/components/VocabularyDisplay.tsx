import React from "react";

interface VocabularyDisplayProps {
  vocabularies: string[];
}

const parseVocabularies = (rawVocabularies: string[]) => {
  return rawVocabularies.map((vocab) => {
    const [word, definition] = vocab.split(" - ");
    return {
      word,
      definition,
    };
  });
};

const VocabularyDisplay: React.FC<VocabularyDisplayProps> = ({
  vocabularies,
}) => {
  if (!vocabularies || vocabularies.length === 0) {
    return null;
  }

  return (
    <div>
      <h4 style={{ margin: "0 0 10px 0", color: "#495057" }}>
        📚 Key Vocabulary:
      </h4>
      <div
        style={{
          background: "white",
          padding: "15px",
          borderRadius: "5px",
          border: "1px solid #e9ecef",
          maxHeight: "150px",
          overflowY: "auto",
          fontSize: "13px",
          lineHeight: "1.5",
        }}
      >
        {parseVocabularies(vocabularies).map(
          ({ word, definition }, index: number) => (
            <div
              key={index}
              style={{
                marginBottom: "8px",
                padding: "5px",
                background: "#f8f9fa",
                borderRadius: "3px",
              }}
            >
              <strong>{word}</strong>
              {definition && <span> - {definition}</span>}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default VocabularyDisplay;
