import React from "react";
import VocabularyDisplay from "./VocabularyDisplay";

interface PodcastData {
  title: string;
  conversation: string;
  vocabularies?: string[];
}

interface ConversationDisplayProps {
  podcast: PodcastData | null;
  isVisible: boolean;
  onClose: () => void;
}

const ConversationDisplay: React.FC<ConversationDisplayProps> = ({
  podcast,
  isVisible,
  onClose,
}) => {
  if (!isVisible || !podcast) {
    return null;
  }

  return (
    <div
      style={{
        background: "#f8f9fa",
        padding: "20px",
        borderRadius: "8px",
        marginBottom: "20px",
        border: "1px solid #dee2e6",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <h3 style={{ margin: 0, color: "#333" }}>📝 {podcast.title}</h3>
        <button
          onClick={onClose}
          style={{
            padding: "5px 10px",
            background: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          ✕ Close
        </button>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <h4 style={{ margin: "0 0 10px 0", color: "#495057" }}>
          💬 Conversation:
        </h4>
        <div
          style={{
            background: "white",
            padding: "15px",
            borderRadius: "5px",
            border: "1px solid #e9ecef",
            maxHeight: "200px",
            overflowY: "auto",
            fontSize: "14px",
            lineHeight: "1.6",
            color: "#333",
          }}
        >
          {podcast.conversation}
        </div>
      </div>

      {podcast.vocabularies && podcast.vocabularies.length > 0 && (
        <VocabularyDisplay vocabularies={podcast.vocabularies} />
      )}
    </div>
  );
};

export default ConversationDisplay;
