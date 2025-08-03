# Advanced Audio Player

A powerful audio player built with Next.js 14 and React, featuring advanced repeat controls, playlist management, and custom progress visualization.

## Features

- **Drag & Drop Upload**: Easily upload audio files by dragging and dropping or clicking to browse
- **Playlist Management**: Organize multiple audio files in a playlist sidebar
- **Custom Progress Bar**: Clear visual progress indicator with blue played portion
- **Repeat Controls**: Set custom repeat ranges with start/end times and repeat count
- **Rewind/Forward**: Quick navigation with customizable time increments
- **Playback Speed**: Adjust playback speed from 0.25x to 4x
- **Mobile Responsive**: Optimized for desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd podcast-player
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Upload Audio Files**: Drag and drop audio files onto the upload area or click to browse
2. **Playlist Navigation**: Click on files in the playlist sidebar to switch between them
3. **Repeat Controls**:
   - Set start and end times for the repeat range
   - Set the number of repetitions
   - Click "Start Repeat" to begin
4. **Navigation**: Use rewind/forward buttons to quickly navigate through audio
5. **Speed Control**: Adjust playback speed using the speed input

## Default Settings

- **Repeat Start Time**: 00:00:00
- **Repeat End Time**: 00:10:00 (10 minutes)
- **Repeat Count**: 999 (range: 1-1000)
- **Rewind/Forward Time**: 5 seconds

## Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **React Hooks**: State management and side effects
- **CSS**: Responsive design with mobile-first approach

## Project Structure

```
podcast-player/
├── app/
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout component
│   └── page.tsx         # Main page component
├── package.json         # Dependencies and scripts
├── next.config.js       # Next.js configuration
├── tsconfig.json        # TypeScript configuration
└── README.md           # Project documentation
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

This project is open source and available under the [MIT License](LICENSE).
