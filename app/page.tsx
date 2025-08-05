"use client";

import { useState, useRef, useEffect } from "react";

interface PlaylistItem {
  file?: File;
  name: string;
  size: number;
  url: string;
  isUrl?: boolean;
}

export default function Home() {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(-1);
  const [repeatInterval, setRepeatInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const [currentRepeatCount, setCurrentRepeatCount] = useState(0);
  const [status, setStatus] = useState("Ready to play");
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [urlInput, setUrlInput] = useState(
    "https://dcs-spotify.megaphone.fm/xxx.mp3"
  );
  const [showUrlInput, setShowUrlInput] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format time as HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Convert HH:MM:SS to seconds
  const timeToSeconds = (timeString: string) => {
    const parts = timeString.split(":");
    if (parts.length === 3) {
      const hours = parseInt(parts[0]) || 0;
      const minutes = parseInt(parts[1]) || 0;
      const seconds = parseInt(parts[2]) || 0;
      return hours * 3600 + minutes * 60 + seconds;
    } else if (parts.length === 2) {
      const minutes = parseInt(parts[0]) || 0;
      const seconds = parseInt(parts[1]) || 0;
      return minutes * 60 + seconds;
    }
    return 0;
  };

  // Convert seconds to HH:MM:SS
  const secondsToTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Handle URL input
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!urlInput.trim()) {
      setStatus("Error: Please enter a valid URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(urlInput);
    } catch (e) {
      setStatus("Error: Invalid URL format");
      return;
    }

    // Just add the URL to playlist without loading
    const newPlaylistItem: PlaylistItem = {
      name: urlInput.split("/").pop() || "Audio from URL",
      size: 0,
      url: urlInput,
      isUrl: true,
    };

    // Check if URL already exists in playlist
    const urlIndex = playlist.findIndex((item) => item.url === urlInput);
    if (urlIndex === -1) {
      setPlaylist((prev) => [...prev, newPlaylistItem]);
      setStatus(`Added "${newPlaylistItem.name}" to playlist`);
    } else {
      setStatus("This URL is already in your playlist");
    }

    // Clear input and hide form
    setUrlInput("");
    setShowUrlInput(false);
  };

  // Handle file upload
  const handleFile = (file: File) => {
    if (!file.type.startsWith("audio/")) {
      setStatus("Error: Please select an audio file");
      return;
    }

    // Add file to playlist if not already present
    const fileIndex = playlist.findIndex(
      (item) => item.name === file.name && item.size === file.size
    );
    if (fileIndex === -1) {
      const newPlaylistItem: PlaylistItem = {
        file: file,
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
      };
      setPlaylist((prev) => [...prev, newPlaylistItem]);
      setCurrentFileIndex(playlist.length);
    } else {
      setCurrentFileIndex(fileIndex);
    }
  };

  // Load file from playlist
  const loadFileFromPlaylist = (index: number) => {
    if (index < 0 || index >= playlist.length) return;

    const playlistItem = playlist[index];

    if (audioRef.current) {
      audioRef.current.src = playlistItem.url;
      audioRef.current.load();

      // Add event listeners for debugging
      const handleCanPlay = () => {
        console.log("Audio can play - duration:", audioRef.current?.duration);
        updateCustomProgress();
        audioRef.current?.removeEventListener("canplay", handleCanPlay);
      };

      const handleLoadedMetadata = () => {
        console.log(
          "Audio metadata loaded - duration:",
          audioRef.current?.duration
        );
        updateCustomProgress();
        audioRef.current?.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata
        );
      };

      const handleError = (e: Event) => {
        console.error("Audio loading error:", e);
        setStatus("Error loading audio file");
      };

      audioRef.current.addEventListener("canplay", handleCanPlay);
      audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);
      audioRef.current.addEventListener("error", handleError);
    }

    setCurrentFileIndex(index);
    setStatus(`Loaded: ${playlistItem.name}`);

    // Reset repeat controls
    const repeatStartInput = document.getElementById(
      "repeatStart"
    ) as HTMLInputElement;
    const repeatEndInput = document.getElementById(
      "repeatEnd"
    ) as HTMLInputElement;
    const repeatCountInput = document.getElementById(
      "repeatCount"
    ) as HTMLInputElement;

    if (repeatStartInput) repeatStartInput.value = "00:00:00";
    if (repeatEndInput) repeatEndInput.value = "00:10:00";
    if (repeatCountInput) repeatCountInput.value = "999";
  };

  // Update playback speed
  const updatePlaybackSpeed = () => {
    const speedInput = document.getElementById(
      "playbackSpeed"
    ) as HTMLInputElement;
    const speed = parseFloat(speedInput.value);

    if (audioRef.current) {
      if (speed >= 0.25 && speed <= 4) {
        audioRef.current.playbackRate = speed;
        setStatus(`Playback speed set to ${speed}x`);
      } else {
        speedInput.value = "1";
        audioRef.current.playbackRate = 1;
        setStatus("Speed reset to 1x");
      }
    }
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            setStatus("Error playing audio: " + error.message);
          });
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      setStatus("No audio file loaded");
    }
  };

  // Seek to position
  const seekToPosition = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;

    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    audioRef.current.currentTime = percentage * audioRef.current.duration;
  };

  // Update custom progress
  const updateCustomProgress = () => {
    if (!audioRef.current) return;

    const progressFill = document.getElementById(
      "progressFill"
    ) as HTMLDivElement;
    const customCurrentTime = document.getElementById(
      "customCurrentTime"
    ) as HTMLSpanElement;
    const customTotalTime = document.getElementById(
      "customTotalTime"
    ) as HTMLSpanElement;

    if (audioRef.current.duration) {
      const percentage =
        (audioRef.current.currentTime / audioRef.current.duration) * 100;
      if (progressFill) progressFill.style.width = percentage + "%";
      if (customCurrentTime)
        customCurrentTime.textContent = formatTime(
          audioRef.current.currentTime
        );
      if (customTotalTime)
        customTotalTime.textContent = formatTime(audioRef.current.duration);
    }
  };

  // Rewind function
  const rewind = () => {
    if (!audioRef.current) return;

    const rewindTime = parseInt(
      (document.getElementById("rewindTime") as HTMLInputElement)?.value || "5"
    );
    const originalTime = audioRef.current.currentTime;
    const newTime = Math.max(0, audioRef.current.currentTime - rewindTime);
    audioRef.current.currentTime = newTime;

    // Update repeat area times - start at new position, end at original position
    const repeatStartInput = document.getElementById(
      "repeatStart"
    ) as HTMLInputElement;
    const repeatEndInput = document.getElementById(
      "repeatEnd"
    ) as HTMLInputElement;

    if (repeatStartInput) repeatStartInput.value = secondsToTime(newTime);
    if (repeatEndInput) repeatEndInput.value = secondsToTime(originalTime);

    // If repeat is currently running, restart it with the new area
    if (repeatInterval) {
      stopRepeat();
      startRepeat();
      setStatus(
        `Rewound ${rewindTime} seconds to ${formatTime(
          newTime
        )} - Repeat restarted with new area`
      );
    } else {
      setStatus(
        `Rewound ${rewindTime} seconds to ${formatTime(
          newTime
        )} - Repeat area updated`
      );
    }
  };

  // Forward function
  const forward = () => {
    if (!audioRef.current) return;

    const forwardTime = parseInt(
      (document.getElementById("forwardTime") as HTMLInputElement)?.value || "5"
    );
    const originalTime = audioRef.current.currentTime;
    const newTime = Math.min(
      audioRef.current.duration,
      audioRef.current.currentTime + forwardTime
    );
    audioRef.current.currentTime = newTime;

    // Update repeat area times - start at original position, end at new position
    const repeatStartInput = document.getElementById(
      "repeatStart"
    ) as HTMLInputElement;
    const repeatEndInput = document.getElementById(
      "repeatEnd"
    ) as HTMLInputElement;

    if (repeatStartInput) repeatStartInput.value = secondsToTime(originalTime);
    if (repeatEndInput) repeatEndInput.value = secondsToTime(newTime);

    // If repeat is currently running, restart it with the new area
    if (repeatInterval) {
      stopRepeat();
      startRepeat();
      setStatus(
        `Forwarded ${forwardTime} seconds to ${formatTime(
          newTime
        )} - Repeat restarted with new area`
      );
    } else {
      setStatus(
        `Forwarded ${forwardTime} seconds to ${formatTime(
          newTime
        )} - Repeat area updated`
      );
    }
  };

  // Start repeat function
  const startRepeat = () => {
    if (!audioRef.current) return;

    const startTime = timeToSeconds(
      (document.getElementById("repeatStart") as HTMLInputElement)?.value ||
        "00:00:00"
    );
    const endTime = timeToSeconds(
      (document.getElementById("repeatEnd") as HTMLInputElement)?.value ||
        "00:10:00"
    );
    const repeatCount = parseInt(
      (document.getElementById("repeatCount") as HTMLInputElement)?.value ||
        "999"
    );

    if (startTime >= endTime) {
      setStatus("Error: Start time must be less than end time");
      return;
    }

    if (startTime < 0 || endTime > audioRef.current.duration) {
      setStatus("Error: Time range is outside audio duration");
      return;
    }

    // Stop any existing repeat
    stopRepeat();

    // Immediately jump to start time and start playing
    audioRef.current.currentTime = startTime;
    audioRef.current.play();
    setIsPlaying(true);
    setIsRepeating(true);

    setCurrentRepeatCount(0);
    const interval = setInterval(() => {
      if (!audioRef.current) return;

      if (audioRef.current.currentTime >= endTime) {
        setCurrentRepeatCount((prev) => {
          const newCount = prev + 1;
          if (newCount >= repeatCount) {
            stopRepeat();
            setIsRepeating(false);
            setStatus("Repeat completed - continuing playback");
            return newCount;
          } else {
            audioRef.current!.currentTime = startTime;
            setStatus(
              `Repeating ${newCount}/${repeatCount} - ${formatTime(
                startTime
              )} to ${formatTime(endTime)}`
            );
            return newCount;
          }
        });
      }
    }, 100);

    setRepeatInterval(interval);
    setStatus(
      `Started repeating ${formatTime(startTime)} to ${formatTime(
        endTime
      )} (${repeatCount} times) - jumped to ${formatTime(startTime)}`
    );
  };

  // Stop repeat function
  const stopRepeat = () => {
    if (repeatInterval) {
      clearInterval(repeatInterval);
      setRepeatInterval(null);
      setIsRepeating(false);
      if (audioRef.current?.paused) {
        setIsPlaying(false);
      }
    }
    setStatus("Repeat stopped");
  };

  // Show upload area
  const showUploadArea = () => {
    // Stop any ongoing repeat
    stopRepeat();

    // Reset audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setStatus("Ready to upload new file");
  };

  // Format time input on blur
  const formatTimeInput = (input: HTMLInputElement) => {
    let value = input.value.trim();

    // Handle different input formats
    if (value.includes(":")) {
      const parts = value.split(":");
      if (parts.length === 2) {
        // MM:SS format
        const mins = parseInt(parts[0]) || 0;
        const secs = parseInt(parts[1]) || 0;
        input.value = `00:${mins.toString().padStart(2, "0")}:${secs
          .toString()
          .padStart(2, "0")}`;
      } else if (parts.length === 3) {
        // HH:MM:SS format
        const hours = parseInt(parts[0]) || 0;
        const mins = parseInt(parts[1]) || 0;
        const secs = parseInt(parts[2]) || 0;
        input.value = `${hours.toString().padStart(2, "0")}:${mins
          .toString()
          .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
      }
    } else {
      // Seconds format
      const seconds = parseInt(value) || 0;
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      input.value = `${hours.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
  };

  // Event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  // Audio event handlers
  const handleTimeUpdate = () => {
    updateCustomProgress();
  };

  const handleLoadedMetadata = () => {
    updateCustomProgress();
  };

  const handleEnded = () => {
    setStatus("Audio playback ended");
    setIsPlaying(false);
  };

  // Effect to load file when playlist or currentFileIndex changes
  useEffect(() => {
    if (currentFileIndex >= 0 && currentFileIndex < playlist.length) {
      loadFileFromPlaylist(currentFileIndex);
    }
  }, [currentFileIndex, playlist]);

  // Add event listeners for time input formatting
  useEffect(() => {
    const repeatStartInput = document.getElementById(
      "repeatStart"
    ) as HTMLInputElement;
    const repeatEndInput = document.getElementById(
      "repeatEnd"
    ) as HTMLInputElement;

    if (repeatStartInput) {
      repeatStartInput.addEventListener("blur", () =>
        formatTimeInput(repeatStartInput)
      );
    }
    if (repeatEndInput) {
      repeatEndInput.addEventListener("blur", () =>
        formatTimeInput(repeatEndInput)
      );
    }

    return () => {
      if (repeatStartInput) {
        repeatStartInput.removeEventListener("blur", () =>
          formatTimeInput(repeatStartInput)
        );
      }
      if (repeatEndInput) {
        repeatEndInput.removeEventListener("blur", () =>
          formatTimeInput(repeatEndInput)
        );
      }
    };
  }, []);

  return (
    <div className="main-container">
      <div className="playlist-sidebar">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <h3 style={{ margin: 0 }}>📋 Playlist</h3>
          <button
            onClick={() => setShowUrlInput(!showUrlInput)}
            style={{
              padding: "8px 12px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            {showUrlInput ? "✕ Cancel" : "+ Add URL"}
          </button>
        </div>

        {showUrlInput && (
          <form
            onSubmit={handleUrlSubmit}
            style={{
              marginBottom: "15px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Enter audio URL"
              style={{
                padding: "8px",
                border: "2px solid #e0e0e0",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "8px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              ✓ Add to Playlist
            </button>
          </form>
        )}

        <div className="playlist-container">
          {playlist.length === 0 ? (
            <div className="playlist-empty">No files uploaded yet</div>
          ) : (
            playlist.map((item, index) => (
              <div
                key={index}
                className={`playlist-item ${
                  index === currentFileIndex ? "active" : ""
                }`}
                onClick={() => loadFileFromPlaylist(index)}
              >
                <div className="playlist-item-title">{item.name}</div>
                <div className="playlist-item-size">
                  {formatFileSize(item.size)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="player-container">
        <h1>Advanced Audio Player</h1>

        <div
          className={`upload-area ${isDragging ? "dragover" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleUploadClick}
          style={{ display: playlist.length === 0 ? "block" : "none" }}
        >
          <div className="upload-content">
            <div className="upload-icon">🎵</div>
            <h3>Drag & Drop Audio File Here</h3>
            <p>or click to browse</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              style={{ display: "none" }}
              onChange={handleFileInputChange}
            />
          </div>
        </div>

        <audio
          ref={audioRef}
          style={{ display: "none" }}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          preload="metadata"
        >
          Your browser does not support the audio element.
        </audio>

        {/* Custom Audio Controls */}
        <div
          id="customControls"
          style={{
            display: playlist.length === 0 ? "none" : "block",
            background: "#f8f9fa",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "10px",
            }}
          >
            <button
              id="playPauseBtn"
              onClick={togglePlayPause}
              style={{
                padding: "8px 12px",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {isPlaying ? "⏸️ Pause" : "▶️ Play"}
            </button>
            <span id="customCurrentTime">00:00</span> /{" "}
            <span id="customTotalTime">00:00</span>
          </div>
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "20px",
              background: "#e9ecef",
              borderRadius: "10px",
              cursor: "pointer",
            }}
            id="progressBar"
            onClick={seekToPosition}
          >
            <div
              id="progressFill"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                background: "#007bff",
                borderRadius: "10px",
                width: "0%",
              }}
            ></div>
          </div>
        </div>

        <div className="time-display">
          <span id="currentTime">00:00</span> /{" "}
          <span id="totalTime">00:00</span>
          <label
            htmlFor="playbackSpeed"
            style={{ marginLeft: "20px", fontWeight: "bold" }}
          >
            Speed:
          </label>
          <input
            type="number"
            id="playbackSpeed"
            defaultValue="1"
            min="0.25"
            max="4"
            step="0.25"
            style={{ width: "60px", marginLeft: "5px", padding: "4px" }}
            onChange={updatePlaybackSpeed}
          />
          <button
            onClick={showUploadArea}
            style={{
              marginLeft: "20px",
              padding: "5px 10px",
              fontSize: "12px",
            }}
          >
            📁 Change File
          </button>
        </div>

        {/* Controls Row */}
        <div className="controls-row">
          {/* Repeat Controls */}
          <div className="controls-section">
            <h3>Repeat Range Controls</h3>
            <div className="control-group">
              <label htmlFor="repeatStart">Start Time:</label>
              <input
                type="text"
                id="repeatStart"
                defaultValue="00:00:00"
                placeholder="HH:MM:SS"
              />
            </div>
            <div className="control-group">
              <label htmlFor="repeatEnd">End Time:</label>
              <input
                type="text"
                id="repeatEnd"
                defaultValue="00:10:00"
                placeholder="HH:MM:SS"
              />
            </div>
            <div className="control-group">
              <label htmlFor="repeatCount">Repeat Count:</label>
              <input
                type="number"
                id="repeatCount"
                defaultValue="999"
                min="1"
                max="1000"
              />
              {isRepeating && (
                <span
                  style={{
                    marginLeft: "10px",
                    color: "#007bff",
                    fontWeight: "bold",
                  }}
                >
                  {currentRepeatCount + 1}/
                  {(document.getElementById("repeatCount") as HTMLInputElement)
                    ?.value || "999"}
                </span>
              )}
            </div>
            <div className="control-group">
              <button
                onClick={startRepeat}
                id="startRepeatBtn"
                disabled={isRepeating}
              >
                ▶️ Start Repeat
              </button>
              <button
                onClick={stopRepeat}
                id="stopRepeatBtn"
                disabled={!isRepeating}
              >
                ⏹️ Stop Repeat
              </button>
            </div>
          </div>

          {/* Rewind/Forward Controls */}
          <div className="controls-section">
            <h3>Rewind/Forward Controls</h3>
            <div className="control-group">
              <label htmlFor="rewindTime">Rewind Time (seconds):</label>
              <input
                type="number"
                id="rewindTime"
                defaultValue="5"
                min="1"
                max="300"
              />
              <button onClick={rewind}>⏪ Rewind</button>
            </div>
            <div className="control-group">
              <label htmlFor="forwardTime">Forward Time (seconds):</label>
              <input
                type="number"
                id="forwardTime"
                defaultValue="5"
                min="1"
                max="300"
              />
              <button onClick={forward}>⏩ Forward</button>
            </div>
          </div>
        </div>

        <div className="status">{status}</div>
      </div>
    </div>
  );
}
